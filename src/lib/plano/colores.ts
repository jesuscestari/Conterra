/** Componentes de un color, de 0 a 255. */
type Canales = readonly [number, number, number]

const limitar = (valor: number): number => Math.min(255, Math.max(0, Math.round(valor)))

const aCanales = (hex: string): Canales => {
  const limpio = hex.replace('#', '')
  const largo = limpio.length === 3 ? 1 : 2
  const leer = (indice: number): number =>
    parseInt(limpio.slice(indice * largo, indice * largo + largo).repeat(3 - largo), 16)

  return [leer(0), leer(1), leer(2)]
}

const aHex = ([r, g, b]: Canales): string =>
  `#${[r, g, b].map((canal) => limitar(canal).toString(16).padStart(2, '0')).join('')}`

/**
 * Acerca un color al negro en la proporcion dada (0 lo deja igual, 1 lo lleva a
 * negro).
 *
 * Se usa para derivar el resaltado de cada estado en vez de anotar un segundo
 * color a mano por cada uno: con once estados, mantener dos listas sincronizadas
 * a ojo es una fuente segura de incoherencias.
 */
export const oscurecer = (hex: string, proporcion: number): string =>
  aHex(aCanales(hex).map((canal) => canal * (1 - proporcion)) as unknown as Canales)

/** Luminancia relativa segun WCAG, de 0 (negro) a 1 (blanco). */
export const luminancia = (hex: string): number => {
  const lineal = aCanales(hex).map((canal) => {
    const c = canal / 255

    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * lineal[0] + 0.7152 * lineal[1] + 0.0722 * lineal[2]
}

export const contraste = (uno: string, otro: string): number => {
  const [claro, oscuro] = [luminancia(uno), luminancia(otro)].sort((a, b) => b - a)

  return (claro + 0.05) / (oscuro + 0.05)
}

/** Casi negro y casi blanco, en vez de los puros, para no cortar tan duro. */
export const TEXTO_OSCURO = '#1f1b14'
export const TEXTO_CLARO = '#ffffff'

/**
 * Elige el texto que mejor se lee sobre un relleno.
 *
 * Existe para que el color de fondo de un estado no quede atado a que el texto
 * sea oscuro: con un texto fijo, cualquier relleno que se oscurezca de mas deja
 * de cumplir contraste, y elegir los colores del mapa pasa a depender de eso.
 */
export const textoSobre = (fondo: string): string =>
  contraste(TEXTO_OSCURO, fondo) >= contraste(TEXTO_CLARO, fondo) ? TEXTO_OSCURO : TEXTO_CLARO
