import { readFile } from 'node:fs/promises'
import path from 'node:path'

const RUTA = path.join(process.cwd(), 'prisma', 'datos', 'numeracion-oficial.json')

export interface NumeroOficial {
  /**
   * Id POSICIONAL del lote, el que sale de recorrer el plano manzana por
   * manzana. No es el id final: ese deriva del numero oficial.
   *
   * La clave tiene que ser posicional porque es lo unico que existe antes de
   * aplicar la numeracion. Es la entrada del emparejamiento, no su resultado.
   */
  readonly idPosicional: string
  /** Numero del lote segun el plano de mensura. */
  readonly numero: number
  readonly superficieM2: number | null
  /** Marcado cuando el emparejamiento automatico no fue concluyente. */
  readonly revisar?: boolean
}

interface FilaArchivo {
  readonly id: string
  readonly numero: number
  readonly superficieM2: number | null
  readonly revisar?: boolean
}

interface Archivo {
  readonly generadoEn: string
  readonly origen: string
  readonly lotes: readonly FilaArchivo[]
}

/**
 * Numeracion y superficies tomadas del plano de mensura oficial.
 *
 * El plano de marketing que se usa como fondo es un redibujo y no coincide
 * geometricamente con la mensura, asi que la correspondencia entre ambos se
 * calculo emparejando manzana por manzana.
 *
 * Devuelve un mapa vacio si el archivo no existe, para que el vectorizador
 * pueda correr igual con su numeracion posicional.
 *
 * @throws si el archivo existe pero no se puede leer o parsear.
 */
export const leerNumeracionOficial = async (): Promise<
  ReadonlyMap<string, NumeroOficial>
> => {
  try {
    const archivo: Archivo = JSON.parse(await readFile(RUTA, 'utf8'))

    return new Map(
      archivo.lotes.map((lote) => [
        lote.id,
        {
          idPosicional: lote.id,
          numero: lote.numero,
          superficieM2: lote.superficieM2,
          revisar: lote.revisar,
        },
      ]),
    )
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return new Map()

    throw new Error(
      `No se pudo leer ${RUTA}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
