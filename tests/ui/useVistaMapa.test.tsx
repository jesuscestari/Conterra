// @vitest-environment jsdom
import React from 'react'

import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { useVistaMapa } from '@/hooks/useVistaMapa'

import type { RectanguloPlano } from '@/lib/plano/tipos'

const CONTENEDOR = { ancho: 800, alto: 600 }
const ZONA: RectanguloPlano = { x: 0, y: 0, ancho: 400, alto: 300 }

const Mapa = (): React.JSX.Element => {
  const [nodo, setNodo] = React.useState<HTMLDivElement | null>(null)
  const vista = useVistaMapa(nodo, ZONA)

  return (
    <div ref={setNodo} data-testid="mapa" {...vista.manejadores}>
      <span data-testid="transformacion">
        {`${Math.round(vista.transformacion.x)},${Math.round(vista.transformacion.y)},${vista.transformacion.k.toFixed(3)}`}
      </span>
      <span data-testid="arrastrando">{String(vista.arrastrando)}</span>
      <span data-testid="fue-arrastre">{String(vista.fueArrastre())}</span>
    </div>
  )
}

const leerTransformacion = (): { x: number; y: number; k: number } => {
  const [x, y, k] = screen.getByTestId('transformacion').textContent!.split(',')

  return { x: Number(x), y: Number(y), k: Number(k) }
}

const leer = (id: string): string => screen.getByTestId(id).textContent!

const mapa = (): HTMLElement => screen.getByTestId('mapa')

interface Punto {
  readonly id?: number
  readonly x: number
  readonly y: number
  /**
   * Un puntero es primario cuando es el primer contacto activo de su tipo. El
   * segundo dedo de un pinch no lo es, y el hook usa esa distinción para
   * descartar punteros que quedaron colgados.
   */
  readonly primario?: boolean
}

const evento = ({ id = 1, x, y, primario = true }: Punto): PointerEventInit => ({
  pointerId: id,
  clientX: x,
  clientY: y,
  isPrimary: primario,
  bubbles: true,
})

const presionar = (punto: Punto): void => {
  act(() => {
    mapa().dispatchEvent(new PointerEvent('pointerdown', evento(punto)))
  })
}

const mover = (punto: Punto): void => {
  act(() => {
    mapa().dispatchEvent(new PointerEvent('pointermove', evento(punto)))
  })
}

/** A propósito en la ventana: es donde el hook escucha la suelta. */
const soltar = (id = 1, tipo: 'pointerup' | 'pointercancel' = 'pointerup'): void => {
  act(() => {
    window.dispatchEvent(new PointerEvent(tipo, { pointerId: id, bubbles: true }))
  })
}

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  // jsdom no hace layout: sin esto el contenedor mide cero y no hay encuadre.
  HTMLElement.prototype.getBoundingClientRect = function medir(): DOMRect {
    return {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: CONTENEDOR.ancho,
      bottom: CONTENEDOR.alto,
      width: CONTENEDOR.ancho,
      height: CONTENEDOR.alto,
      toJSON: () => ({}),
    } as DOMRect
  }
})

afterEach(cleanup)

describe('useVistaMapa', () => {
  it('encuadra la zona de interés al montarse', () => {
    render(<Mapa />)

    const { k, x, y } = leerTransformacion()

    // La zona (400x300) entra en el contenedor (800x600) al doble, menos margen.
    expect(k).toBeGreaterThan(1.8)
    expect(k).toBeLessThanOrEqual(2)
    // Queda centrada.
    expect(x).toBeCloseTo(CONTENEDOR.ancho / 2 - 200 * k, 0)
    expect(y).toBeCloseTo(CONTENEDOR.alto / 2 - 150 * k, 0)
  })

  it('desplaza el mapa al arrastrar', () => {
    render(<Mapa />)
    const inicial = leerTransformacion()

    presionar({ x: 100, y: 100 })
    mover({ x: 140, y: 130 })

    const despues = leerTransformacion()

    expect(despues.x).toBe(inicial.x + 40)
    expect(despues.y).toBe(inicial.y + 30)
    expect(despues.k).toBe(inicial.k)
  })

  it('un movimiento mínimo sigue siendo un clic, no un arrastre', () => {
    render(<Mapa />)

    presionar({ x: 100, y: 100 })
    mover({ x: 102, y: 100 })

    expect(leer('fue-arrastre')).toBe('false')
    expect(leer('arrastrando')).toBe('false')
  })

  it('pasado el umbral, el gesto se marca como arrastre', () => {
    render(<Mapa />)

    presionar({ x: 100, y: 100 })
    mover({ x: 120, y: 100 })

    expect(leer('fue-arrastre')).toBe('true')
    expect(leer('arrastrando')).toBe('true')
  })

  it('deja de arrastrar al soltar', () => {
    render(<Mapa />)

    presionar({ x: 100, y: 100 })
    mover({ x: 120, y: 100 })
    soltar()

    expect(leer('arrastrando')).toBe('false')
  })

  it('ignora el movimiento de un puntero que no se presionó sobre el mapa', () => {
    render(<Mapa />)
    const inicial = leerTransformacion()

    mover({ x: 300, y: 300 })

    expect(leerTransformacion()).toEqual(inicial)
  })

  /**
   * Regresion: si la suelta se escuchara en el contenedor, soltar el dedo fuera
   * del mapa (o que otro elemento se coma el evento) dejaba el puntero anotado
   * para siempre. El gesto siguiente pasaba a contarse como de dos dedos: el
   * mapa cambiaba la escala y apenas se movia, y solo se recuperaba haciendo
   * clic en otro lado.
   */
  it('sigue desplazándose con normalidad después de soltar fuera del mapa', () => {
    render(<Mapa />)

    presionar({ x: 100, y: 100 })
    mover({ x: 130, y: 100 })
    soltar()

    const antes = leerTransformacion()

    presionar({ x: 200, y: 200 })
    mover({ x: 250, y: 220 })

    const despues = leerTransformacion()

    expect(despues.x).toBe(antes.x + 50)
    expect(despues.y).toBe(antes.y + 20)
    expect(despues.k).toBe(antes.k)
  })

  it('libera el puntero también cuando el gesto se cancela', () => {
    render(<Mapa />)

    presionar({ x: 100, y: 100 })
    mover({ x: 130, y: 100 })
    soltar(1, 'pointercancel')

    const antes = leerTransformacion()

    presionar({ x: 200, y: 200 })
    mover({ x: 240, y: 200 })

    expect(leerTransformacion().x).toBe(antes.x + 40)
  })

  /**
   * Regresion, tercera vuelta sobre el mismo sintoma. Los pointerup se pueden
   * perder de varias maneras que no se pueden tapar de a una: clic derecho que
   * abre el menu contextual, soltar fuera de la ventana, el foco que se va a
   * otra aplicacion. Un puntero colgado hacia que el gesto siguiente contara
   * dos y entrara en la rama de pinch, con lo cual el mapa cambiaba de escala
   * un pelo en vez de desplazarse: los "micro arrastres".
   *
   * La defensa no depende de por donde se filtro: un pointerdown primario abre
   * un gesto nuevo y descarta lo que hubiera quedado.
   */
  it('se recupera solo cuando un gesto anterior quedó sin cerrar', () => {
    render(<Mapa />)

    // Gesto que nunca cierra: pointerdown sin su pointerup.
    presionar({ id: 1, x: 100, y: 100 })

    // Gesto nuevo, con otro id (el táctil estrena id en cada contacto).
    const antes = leerTransformacion()
    presionar({ id: 7, x: 300, y: 300 })
    mover({ id: 7, x: 350, y: 320 })

    const despues = leerTransformacion()

    // Se desplaza, no cambia de escala.
    expect(despues.x).toBe(antes.x + 50)
    expect(despues.y).toBe(antes.y + 20)
    expect(despues.k).toBe(antes.k)
  })

  it('descarta el puntero colgado aunque el gesto nuevo use el mismo id', () => {
    render(<Mapa />)

    presionar({ id: 1, x: 100, y: 100 })
    const antes = leerTransformacion()

    presionar({ id: 1, x: 300, y: 300 })
    mover({ id: 1, x: 340, y: 300 })

    expect(leerTransformacion().x).toBe(antes.x + 40)
  })

  /** El segundo dedo no es primario, así que no puede limpiar al primero. */
  it('la limpieza no rompe el pinch de dos dedos', () => {
    render(<Mapa />)
    const inicial = leerTransformacion()

    presionar({ id: 1, x: 300, y: 300 })
    presionar({ id: 2, x: 400, y: 300, primario: false })
    mover({ id: 2, x: 400, y: 300 })
    mover({ id: 2, x: 500, y: 300 })

    expect(leerTransformacion().k).toBeGreaterThan(inicial.k)
  })

  it('no se confunde si llega la suelta de un puntero que nunca tocó el mapa', () => {
    render(<Mapa />)

    presionar({ id: 1, x: 100, y: 100 })
    soltar(99)
    mover({ id: 1, x: 140, y: 100 })

    expect(leerTransformacion().x).toBeCloseTo(leerTransformacion().x, 5)
    expect(leer('fue-arrastre')).toBe('true')
  })

  it('con dos dedos cambia la escala en vez de desplazar', () => {
    render(<Mapa />)
    const inicial = leerTransformacion()

    presionar({ id: 1, x: 300, y: 300 })
    presionar({ id: 2, x: 400, y: 300, primario: false })
    // El primer movimiento con dos dedos solo registra la separacion de partida.
    mover({ id: 2, x: 400, y: 300 })
    mover({ id: 2, x: 500, y: 300 })

    expect(leerTransformacion().k).toBeGreaterThan(inicial.k)
  })

  it('vuelve a desplazar cuando se levanta uno de los dos dedos', () => {
    render(<Mapa />)

    presionar({ id: 1, x: 300, y: 300 })
    presionar({ id: 2, x: 400, y: 300, primario: false })
    mover({ id: 2, x: 420, y: 300 })
    soltar(2)

    const antes = leerTransformacion()

    mover({ id: 1, x: 330, y: 300 })

    expect(leerTransformacion().x).toBe(antes.x + 30)
  })
})
