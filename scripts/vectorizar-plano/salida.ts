import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { PlanoGeometria } from '@/lib/plano/tipos'

const aCadenaDePuntos = (puntos: PlanoGeometria['lotes'][number]['puntos']): string =>
  puntos.map(([x, y]) => `${x},${y}`).join(' ')

export const escribirGeometria = async (
  ruta: string,
  geometria: PlanoGeometria,
): Promise<void> => {
  try {
    await mkdir(path.dirname(ruta), { recursive: true })
    await writeFile(ruta, JSON.stringify(geometria), 'utf8')
  } catch (error) {
    throw new Error(
      `No se pudo escribir la geometria en "${ruta}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
}

/**
 * SVG de control para revisar a ojo que la deteccion haya salido bien: cada
 * parcela con su contorno y su codigo. No lo consume la aplicacion.
 */
export const escribirPrevisualizacion = async (
  ruta: string,
  geometria: PlanoGeometria,
): Promise<void> => {
  const poligonos = geometria.lotes
    .map(
      (lote) =>
        `<polygon points="${aCadenaDePuntos(lote.puntos)}" fill="#8aa84f" stroke="#1f2d16" stroke-width="0.4" />` +
        `<text x="${lote.centroide[0]}" y="${lote.centroide[1]}" font-size="4" text-anchor="middle" fill="#12200b">${lote.numero}</text>`,
    )
    .join('\n')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${geometria.ancho} ${geometria.alto}" width="${geometria.ancho}" height="${geometria.alto}">
<rect width="${geometria.ancho}" height="${geometria.alto}" fill="#f4f1e6" />
${poligonos}
</svg>`

  try {
    await mkdir(path.dirname(ruta), { recursive: true })
    await writeFile(ruta, svg, 'utf8')
  } catch (error) {
    throw new Error(
      `No se pudo escribir la previsualizacion en "${ruta}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
}
