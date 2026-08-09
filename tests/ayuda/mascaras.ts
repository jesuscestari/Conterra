import type { MascaraBinaria } from '../../scripts/vectorizar-plano/mascara'

/**
 * Construye una mascara binaria a partir de un dibujo en texto, donde `#` es
 * pixel de parcela y cualquier otro caracter es fondo. Hace los tests legibles:
 * se ve la forma que se esta probando.
 */
export const mascaraDeTexto = (filas: readonly string[]): MascaraBinaria => {
  const alto = filas.length
  const ancho = Math.max(...filas.map((f) => f.length))
  const datos = new Uint8Array(ancho * alto)

  filas.forEach((fila, y) => {
    for (let x = 0; x < fila.length; x += 1) {
      if (fila[x] === '#') datos[y * ancho + x] = 1
    }
  })

  return { ancho, alto, datos }
}

/** Vuelve a texto una mascara, para poder comparar formas en los assertions. */
export const textoDeMascara = ({ ancho, alto, datos }: MascaraBinaria): string[] =>
  Array.from({ length: alto }, (_, y) =>
    Array.from({ length: ancho }, (_, x) => (datos[y * ancho + x] ? '#' : '.')).join(''),
  )

/** Rectangulo macizo, util para armar componentes de prueba. */
export const rectangulo = (
  ancho: number,
  alto: number,
  x0: number,
  y0: number,
  w: number,
  h: number,
): MascaraBinaria => {
  const datos = new Uint8Array(ancho * alto)
  for (let y = y0; y < y0 + h; y += 1) {
    for (let x = x0; x < x0 + w; x += 1) {
      datos[y * ancho + x] = 1
    }
  }
  return { ancho, alto, datos }
}
