import sharp from 'sharp'

import { aHsv } from './color'
import { VERDE_LOTE } from './config'

export interface MascaraBinaria {
  readonly ancho: number
  readonly alto: number
  /** 1 = pixel de parcela, 0 = fondo. Indexada como `y * ancho + x`. */
  readonly datos: Uint8Array
}

const esVerdeDeLote = (r: number, g: number, b: number): boolean => {
  const { tono, saturacion, valor } = aHsv(r, g, b)

  return (
    tono >= VERDE_LOTE.tonoMin &&
    tono <= VERDE_LOTE.tonoMax &&
    saturacion >= VERDE_LOTE.saturacionMin &&
    valor >= VERDE_LOTE.valorMin &&
    valor <= VERDE_LOTE.valorMax
  )
}

/**
 * Decodifica el plano y devuelve la mascara binaria de las parcelas.
 *
 * @throws si la imagen no existe o no se puede decodificar.
 */
export const construirMascara = async (rutaImagen: string): Promise<MascaraBinaria> => {
  try {
    const { data, info } = await sharp(rutaImagen)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { width: ancho, height: alto, channels: canales } = info
    const datos = new Uint8Array(ancho * alto)

    for (let indice = 0; indice < datos.length; indice += 1) {
      const base = indice * canales
      const alfa = canales === 4 ? data[base + 3] : 255

      if (alfa < 128) continue

      if (esVerdeDeLote(data[base], data[base + 1], data[base + 2])) {
        datos[indice] = 1
      }
    }

    return { ancho, alto, datos }
  } catch (error) {
    throw new Error(
      `No se pudo leer el plano en "${rutaImagen}". Verificá que el archivo exista y sea una imagen valida. Causa: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
}
