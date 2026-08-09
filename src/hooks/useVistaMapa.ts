import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { PuntoPlano, RectanguloPlano } from '@/lib/plano/tipos'

const ZOOM = { minimo: 0.4, maximo: 14, porRueda: 0.0016, porBoton: 1.5 } as const

/** Movimiento en pixeles a partir del cual un pointerdown deja de ser un click. */
const UMBRAL_ARRASTRE_PX = 4

interface Transformacion {
  readonly x: number
  readonly y: number
  readonly k: number
}

interface Medidas {
  readonly ancho: number
  readonly alto: number
}

/** Margen alrededor de la zona encuadrada, como fraccion de su lado. */
const MARGEN_ENCUADRE = 0.04

const limitar = (valor: number, minimo: number, maximo: number): number =>
  Math.min(maximo, Math.max(minimo, valor))

/**
 * Toma el puntero para poder seguir desplazando aunque el cursor se vaya del
 * mapa. Es una mejora, no un requisito: si el navegador la rechaza (puede pasar
 * si el puntero ya no esta activo) se sigue igual, porque una excepcion acá
 * cortaria el desplazamiento por completo.
 */
const capturarPuntero = (evento: React.PointerEvent<HTMLDivElement>): void => {
  try {
    if (!evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.setPointerCapture(evento.pointerId)
    }
  } catch {
    // Sin captura el desplazamiento igual funciona mientras el cursor no salga.
  }
}

/** Transformacion que deja la zona de interes centrada y completa en pantalla. */
const calcularEncuadre = (
  contenedor: Medidas | null,
  zona: RectanguloPlano | null,
): Transformacion | null => {
  if (!zona || !contenedor || contenedor.ancho === 0 || contenedor.alto === 0) return null

  const margen = Math.max(zona.ancho, zona.alto) * MARGEN_ENCUADRE
  const k = limitar(
    Math.min(contenedor.ancho / (zona.ancho + margen * 2), contenedor.alto / (zona.alto + margen * 2)),
    ZOOM.minimo,
    ZOOM.maximo,
  )

  return {
    k,
    x: contenedor.ancho / 2 - (zona.x + zona.ancho / 2) * k,
    y: contenedor.alto / 2 - (zona.y + zona.alto / 2) * k,
  }
}

/**
 * Manejadores que hay que colgar del contenedor del mapa. La suelta del puntero
 * no está acá: se escucha en la ventana, para no perdérsela si el dedo se
 * levanta fuera del mapa.
 */
export interface ManejadoresPuntero {
  readonly onPointerDown: (evento: React.PointerEvent<HTMLDivElement>) => void
  readonly onPointerMove: (evento: React.PointerEvent<HTMLDivElement>) => void
}

export interface VistaMapa {
  readonly transformacion: Transformacion
  /** Solo para el aspecto (cursor y eventos del SVG). */
  readonly arrastrando: boolean
  /** Si el gesto que acaba de terminar fue un arrastre y no un clic. */
  readonly fueArrastre: () => boolean
  /** Tamaño del contenedor del mapa, o null hasta que se pueda medir. */
  readonly medidasContenedor: Medidas | null
  readonly listo: boolean
  readonly manejadores: ManejadoresPuntero
  readonly aPantalla: (punto: PuntoPlano) => PuntoPlano
  readonly acercar: () => void
  readonly alejar: () => void
  readonly ajustar: () => void
  readonly centrarEn: (punto: PuntoPlano, escala?: number) => void
}

/**
 * Desplazamiento y acercamiento del plano. Trabaja sobre una transformacion
 * `translate + scale` que se aplica al contenedor de la imagen y del SVG, de
 * modo que ambos se mueven juntos y sin desfasajes.
 *
 * Recibe el nodo del contenedor por estado y no por `ref` a proposito: el
 * contenedor se monta despues que el hook (recien cuando llega la geometria),
 * y con una ref no habria forma de reaccionar a esa aparicion.
 */
export const useVistaMapa = (
  contenedor: HTMLDivElement | null,
  zonaDeInteres: RectanguloPlano | null,
): VistaMapa => {
  const [transformacion, setTransformacion] = useState<Transformacion>({ x: 0, y: 0, k: 1 })
  const [medidas, setMedidas] = useState<Medidas | null>(null)
  const [arrastrando, setArrastrando] = useState(false)

  const punteros = useRef(new Map<number, PuntoPlano>())
  const arrastre = useRef<{ x: number; y: number; recorrido: number } | null>(null)
  const separacionPrevia = useRef<number | null>(null)

  /**
   * Marca si el gesto en curso llego a ser un arrastre. Se lleva en una `ref` y
   * no en el estado a proposito: el `click` que sigue al `pointerup` tiene que
   * poder consultarlo con certeza, sin depender de cuando React vuelva a
   * renderizar ni de que se dispare un cuadro de animacion.
   */
  const huboArrastre = useRef(false)

  useEffect(() => {
    if (!contenedor) return

    // Se mide una vez a mano y despues se delega en el observador: la primera
    // notificacion del ResizeObserver puede tardar un cuadro (o no llegar
    // nunca, si la pestana esta oculta) y el encuadre inicial no puede
    // depender de eso.
    const medir = ({ width, height }: DOMRectReadOnly | DOMRect): void => {
      setMedidas({ ancho: width, alto: height })
    }

    medir(contenedor.getBoundingClientRect())

    const observador = new ResizeObserver(([entrada]) => medir(entrada.contentRect))

    observador.observe(contenedor)

    return () => observador.disconnect()
  }, [contenedor])

  const encuadre = useMemo<Transformacion | null>(
    () => calcularEncuadre(medidas, zonaDeInteres),
    [zonaDeInteres, medidas],
  )

  const ajustar = useCallback(() => {
    if (!contenedor) return

    // Se remide el contenedor en el momento en vez de usar el ultimo valor
    // guardado: si el observador todavia no reporto un cambio de tamaño, el
    // botón igual tiene que encuadrar bien.
    const { width, height } = contenedor.getBoundingClientRect()
    const calculado = calcularEncuadre({ ancho: width, alto: height }, zonaDeInteres)

    if (calculado) setTransformacion(calculado)
  }, [contenedor, zonaDeInteres])

  const encuadreAplicado = useRef(false)

  useEffect(() => {
    if (!encuadre || encuadreAplicado.current) return

    encuadreAplicado.current = true
    setTransformacion(encuadre)
  }, [encuadre])

  const escalarHacia = useCallback((factor: number, focoX: number, focoY: number) => {
    setTransformacion((previa) => {
      const k = limitar(previa.k * factor, ZOOM.minimo, ZOOM.maximo)
      const ajuste = k / previa.k

      return {
        k,
        x: focoX - (focoX - previa.x) * ajuste,
        y: focoY - (focoY - previa.y) * ajuste,
      }
    })
  }, [])

  const escalarDesdeElCentro = useCallback(
    (factor: number) => {
      if (!medidas) return

      escalarHacia(factor, medidas.ancho / 2, medidas.alto / 2)
    },
    [escalarHacia, medidas],
  )

  useEffect(() => {
    if (!contenedor) return

    // Se registra a mano porque React marca `wheel` como pasivo y no dejaria
    // frenar el desplazamiento de la pagina al hacer zoom.
    const alRodar = (evento: WheelEvent): void => {
      evento.preventDefault()

      const caja = contenedor.getBoundingClientRect()

      escalarHacia(
        Math.exp(-evento.deltaY * ZOOM.porRueda),
        evento.clientX - caja.left,
        evento.clientY - caja.top,
      )
    }

    contenedor.addEventListener('wheel', alRodar, { passive: false })

    return () => contenedor.removeEventListener('wheel', alRodar)
  }, [contenedor, escalarHacia])

  const separacionEntrePunteros = (): number | null => {
    const activos = [...punteros.current.values()]
    if (activos.length < 2) return null

    return Math.hypot(activos[0][0] - activos[1][0], activos[0][1] - activos[1][1])
  }

  const alPresionar = useCallback((evento: React.PointerEvent<HTMLDivElement>) => {
    // Un pointerdown primario es, por definicion, el primer contacto activo de
    // su tipo: abre un gesto nuevo. Si todavia quedaba algun puntero anotado,
    // es el fantasma de un gesto que nunca cerro y hay que soltarlo.
    //
    // Los pointerup se pueden perder de varias maneras y no se pueden tapar de
    // a una: un clic derecho que abre el menu contextual, soltar el boton fuera
    // de la ventana, el foco que se va a otra aplicacion. Con un fantasma
    // anotado, el gesto siguiente cuenta dos punteros y entra en la rama de
    // pinch: el mapa cambia de escala un pelo en vez de desplazarse, y como la
    // captura se toma solo en la rama de arrastre, el puntero tampoco queda
    // anclado. Es exactamente el sintoma de "micro arrastres".
    //
    // Esto no rompe el pinch: el segundo dedo de un gesto de dos NO es
    // primario, asi que no limpia al primero.
    if (evento.isPrimary) {
      punteros.current.clear()
      separacionPrevia.current = null
    }

    punteros.current.set(evento.pointerId, [evento.clientX, evento.clientY])

    // Ojo: acá NO se captura el puntero. Con la captura activa el navegador
    // despacha el `click` al elemento que capturó y no al que está debajo, con
    // lo cual los polígonos de los lotes nunca reciben el clic. La captura se
    // toma recién cuando el gesto se confirma como arrastre (ver `alMover`).
    if (punteros.current.size === 1) {
      arrastre.current = { x: evento.clientX, y: evento.clientY, recorrido: 0 }
      huboArrastre.current = false
    }
  }, [])

  const alMover = useCallback(
    (evento: React.PointerEvent<HTMLDivElement>) => {
      if (!punteros.current.has(evento.pointerId)) return

      punteros.current.set(evento.pointerId, [evento.clientX, evento.clientY])

      if (punteros.current.size >= 2) {
        const separacion = separacionEntrePunteros()

        if (separacion && separacionPrevia.current) {
          const caja = evento.currentTarget.getBoundingClientRect()
          const activos = [...punteros.current.values()]

          escalarHacia(
            separacion / separacionPrevia.current,
            (activos[0][0] + activos[1][0]) / 2 - caja.left,
            (activos[0][1] + activos[1][1]) / 2 - caja.top,
          )
        }

        separacionPrevia.current = separacion
        arrastre.current = null
        return
      }

      const previo = arrastre.current
      if (!previo) return

      const dx = evento.clientX - previo.x
      const dy = evento.clientY - previo.y
      const recorrido = previo.recorrido + Math.hypot(dx, dy)

      arrastre.current = { x: evento.clientX, y: evento.clientY, recorrido }

      if (recorrido > UMBRAL_ARRASTRE_PX) {
        huboArrastre.current = true
        setArrastrando(true)
        capturarPuntero(evento)
      }

      setTransformacion((actual) => ({ ...actual, x: actual.x + dx, y: actual.y + dy }))
    },
    [escalarHacia],
  )

  /**
   * La suelta se escucha en la ventana y no en el contenedor.
   *
   * Si el `pointerup` no llega al contenedor (porque se soltó fuera del mapa o
   * porque algo interrumpió el evento), el puntero quedaba anotado para siempre.
   * A partir de ahí el gesto siguiente se contaba como de dos dedos: en vez de
   * desplazar, el mapa cambiaba la escala y apenas se movía, y solo se
   * recuperaba al hacer otro clic. Escuchando en la ventana no hay forma de
   * perderse la suelta.
   */
  useEffect(() => {
    const alSoltar = (evento: PointerEvent): void => {
      if (!punteros.current.delete(evento.pointerId)) return

      if (punteros.current.size < 2) separacionPrevia.current = null

      // Al levantar un dedo de un gesto de dos, el que queda tiene que poder
      // seguir desplazando. El arrastre se retoma desde donde esta ese dedo, y
      // se da por recorrido para que el gesto no se confunda con un clic.
      if (punteros.current.size === 1) {
        const [x, y] = [...punteros.current.values()][0]

        arrastre.current = { x, y, recorrido: UMBRAL_ARRASTRE_PX + 1 }
        huboArrastre.current = true
      }

      if (punteros.current.size === 0) {
        arrastre.current = null
        // `huboArrastre` sigue en pie hasta el proximo pointerdown, asi que el
        // `click` que viene detras del pointerup se descarta igual.
        setArrastrando(false)
      }
    }

    window.addEventListener('pointerup', alSoltar)
    window.addEventListener('pointercancel', alSoltar)

    return () => {
      window.removeEventListener('pointerup', alSoltar)
      window.removeEventListener('pointercancel', alSoltar)
    }
  }, [])

  const fueArrastre = useCallback(() => huboArrastre.current, [])

  const aPantalla = useCallback(
    ([x, y]: PuntoPlano): PuntoPlano => [
      x * transformacion.k + transformacion.x,
      y * transformacion.k + transformacion.y,
    ],
    [transformacion],
  )

  const centrarEn = useCallback(
    ([x, y]: PuntoPlano, escala?: number) => {
      if (!medidas) return

      setTransformacion((previa) => {
        const k = limitar(escala ?? previa.k, ZOOM.minimo, ZOOM.maximo)

        return { k, x: medidas.ancho / 2 - x * k, y: medidas.alto / 2 - y * k }
      })
    },
    [medidas],
  )

  return {
    transformacion,
    arrastrando,
    fueArrastre,
    medidasContenedor: medidas,
    listo: encuadre !== null,
    manejadores: {
      onPointerDown: alPresionar,
      onPointerMove: alMover,
    },
    aPantalla,
    acercar: () => escalarDesdeElCentro(ZOOM.porBoton),
    alejar: () => escalarDesdeElCentro(1 / ZOOM.porBoton),
    ajustar,
    centrarEn,
  }
}
