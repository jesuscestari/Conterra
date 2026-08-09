import { ESCALA } from './config'

const mediana = (valores: readonly number[]): number => {
  const ordenados = [...valores].sort((a, b) => a - b)

  return ordenados[Math.floor(ordenados.length / 2)]
}

/**
 * Devuelve cuantos metros representa un pixel del plano.
 *
 * El plano de marketing no trae escala grafica, asi que se calibra con el dato
 * publicado (parcelas de 600 a 1000 m2): se elige la escala que deja la mediana
 * de las superficies en el valor objetivo. Si conseguis una medida real del
 * loteo, fijala en `ESCALA.metrosPorPixelFijo` y esta estimacion se ignora.
 */
export const calcularMetrosPorPixel = (areasPx: readonly number[]): number => {
  if (ESCALA.metrosPorPixelFijo !== null) return ESCALA.metrosPorPixelFijo

  if (areasPx.length === 0) {
    throw new Error('No hay parcelas detectadas: no se puede calibrar la escala.')
  }

  return Math.sqrt(ESCALA.superficieMedianaObjetivoM2 / mediana(areasPx))
}

/** Superficie en m2 redondeada a decena, que es la precision util para un folleto. */
export const superficieEnM2 = (areaPx: number, metrosPorPixel: number): number =>
  Math.round((areaPx * metrosPorPixel * metrosPorPixel) / 10) * 10
