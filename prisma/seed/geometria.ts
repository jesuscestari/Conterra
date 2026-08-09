import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { PlanoGeometria } from '@/lib/plano/tipos'

const RUTA_GEOMETRIA = path.join(process.cwd(), 'public', 'data', 'plano-geometria.json')

const esGeometriaValida = (valor: unknown): valor is PlanoGeometria =>
  typeof valor === 'object' &&
  valor !== null &&
  Array.isArray((valor as PlanoGeometria).lotes) &&
  (valor as PlanoGeometria).lotes.length > 0

/**
 * Lee la geometria generada por el vectorizador. Es la fuente de verdad de que
 * lotes existen y de su superficie.
 *
 * @throws si el archivo no existe o no tiene el formato esperado.
 */
export const leerGeometria = async (): Promise<PlanoGeometria> => {
  try {
    const contenido = await readFile(RUTA_GEOMETRIA, 'utf8')
    const geometria: unknown = JSON.parse(contenido)

    if (!esGeometriaValida(geometria)) {
      throw new Error('el archivo no tiene lotes')
    }

    return geometria
  } catch (error) {
    throw new Error(
      `No se pudo leer ${RUTA_GEOMETRIA}. Corré primero \`npm run vectorizar\`. Causa: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
}
