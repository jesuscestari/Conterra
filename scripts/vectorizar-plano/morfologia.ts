import type { MascaraBinaria } from './mascara'

/**
 * Erosion con vecindario cuadrado. Sirve para cortar los puentes de un pixel
 * que el antialiasing deja entre parcelas contiguas, de modo que el etiquetado
 * las separe en componentes distintas.
 */
export const erosionar = (mascara: MascaraBinaria, radio: number): MascaraBinaria => {
  if (radio <= 0) return mascara

  const { ancho, alto, datos } = mascara
  const erosionada = new Uint8Array(datos.length)

  for (let y = 0; y < alto; y += 1) {
    for (let x = 0; x < ancho; x += 1) {
      const indice = y * ancho + x

      if (datos[indice] === 0) continue
      if (x < radio || y < radio || x >= ancho - radio || y >= alto - radio) continue

      if (vecindarioCompleto(datos, ancho, x, y, radio)) {
        erosionada[indice] = 1
      }
    }
  }

  return { ancho, alto, datos: erosionada }
}

const vecindarioCompleto = (
  datos: Uint8Array,
  ancho: number,
  x: number,
  y: number,
  radio: number,
): boolean => {
  for (let dy = -radio; dy <= radio; dy += 1) {
    for (let dx = -radio; dx <= radio; dx += 1) {
      if (datos[(y + dy) * ancho + (x + dx)] === 0) return false
    }
  }

  return true
}
