import type { LoteGeometria } from '@/lib/plano/tipos'

import type { NumeroOficial } from './numeracionOficial'

/** El id se rellena con ceros para que ordene igual como texto que como numero. */
export const idDeLote = (numero: number): string => `L${String(numero).padStart(3, '0')}`

export const idCoincideConNumero = (lote: Pick<LoteGeometria, 'id' | 'numero'>): boolean =>
  lote.id === idDeLote(lote.numero)

export interface IdentidadLote {
  readonly id: string
  readonly numero: number
  readonly superficieM2: number
}

/**
 * Decide el id, el numero y la superficie definitivos de una parcela.
 *
 * El vectorizador numera las parcelas por su posicion en el recorrido del
 * loteo, que no tiene nada que ver con la numeracion real. Esta funcion cambia
 * esa numeracion provisoria por la del plano de mensura y deriva el id del
 * numero final, para que al mirar la base los dos valores coincidan.
 *
 * Sin numeracion oficial se queda con la posicional, y el id igual coincide.
 *
 * @param numeroPosicional numero provisorio, del recorrido del loteo
 * @param superficieEstimada superficie calculada a partir de los pixeles
 */
export const resolverIdentidad = (
  numeroPosicional: number,
  superficieEstimada: number,
  numeracion: ReadonlyMap<string, NumeroOficial>,
): IdentidadLote => {
  const oficial = numeracion.get(idDeLote(numeroPosicional))
  const numero = oficial?.numero ?? numeroPosicional

  return {
    id: idDeLote(numero),
    numero,
    // La superficie de la mensura le gana a la estimada a partir de pixeles,
    // que arrastra el error de escala del redibujo del folleto.
    superficieM2: oficial?.superficieM2 ?? superficieEstimada,
  }
}

/**
 * El id sale del numero, asi que dos lotes con el mismo numero colisionarian y
 * uno pisaria al otro al sembrar. No puede pasar con la numeracion completa de
 * la mensura, pero si se edita a mano el JSON conviene enterarse al generar la
 * geometria y no en produccion.
 *
 * @throws si hay ids repetidos, nombrando cuales.
 */
export const verificarIdsUnicos = (lotes: readonly LoteGeometria[]): void => {
  const vistos = new Set<string>()
  const repetidos = new Set<string>()

  for (const lote of lotes) {
    if (vistos.has(lote.id)) repetidos.add(lote.id)
    vistos.add(lote.id)
  }

  if (repetidos.size > 0) {
    throw new Error(
      `La numeracion produce ids repetidos: ${[...repetidos].join(', ')}. ` +
        'Revisá prisma/datos/numeracion-oficial.json: hay lotes con el mismo número.',
    )
  }
}
