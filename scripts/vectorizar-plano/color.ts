export interface Hsv {
  /** Tono en grados, 0 a 360. */
  readonly tono: number
  readonly saturacion: number
  readonly valor: number
}

/**
 * Conversion RGB a HSV. Se trabaja en HSV y no en RGB porque en este plano el
 * relleno de las parcelas y las lineas que las dividen comparten el tono: lo
 * que las distingue es el valor, y en HSV ese corte es una sola comparacion.
 */
export const aHsv = (r: number, g: number, b: number): Hsv => {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  if (delta === 0) {
    return { tono: 0, saturacion: 0, valor: max }
  }

  const tonoCrudo =
    max === rn
      ? ((gn - bn) / delta) % 6
      : max === gn
        ? (bn - rn) / delta + 2
        : (rn - gn) / delta + 4

  return {
    tono: (tonoCrudo * 60 + 360) % 360,
    saturacion: max === 0 ? 0 : delta / max,
    valor: max,
  }
}
