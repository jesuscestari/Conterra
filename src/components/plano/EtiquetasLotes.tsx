import { memo } from 'react'

import type { LoteCompleto } from '@/lib/lotes/tipos'
import type { EstadoLote } from '@/lib/plano/estado'

/**
 * Alto del número en unidades del plano, no en píxeles de pantalla. Al vivir en
 * el mismo sistema de coordenadas que los polígonos, crece y se achica junto
 * con ellos: la proporción entre el número y su parcela es siempre la misma.
 */
const TAMANO_EN_UNIDADES_DEL_PLANO = 6

/**
 * Por debajo de este alto en pantalla el número deja de leerse y solo ensucia
 * el plano, así que no se dibuja. Como el tamaño ahora depende del zoom, el
 * corte se expresa en píxeles reales y no en un umbral de escala suelto.
 */
const MINIMO_LEGIBLE_PX = 7

/** Verde muy oscuro, el mismo de las líneas divisorias del plano. */
const COLOR = '#1f2d16'

interface Props {
  readonly lotes: readonly LoteCompleto[]
  readonly escala: number
  readonly filtro: EstadoLote | null
}

const EtiquetasLotesBase = ({ lotes, escala, filtro }: Props) => {
  if (TAMANO_EN_UNIDADES_DEL_PLANO * escala < MINIMO_LEGIBLE_PX) return null

  return (
    <g
      className="select-none"
      // Los números no interceptan el puntero: el clic tiene que llegar al
      // polígono que está debajo.
      pointerEvents="none"
      fontSize={TAMANO_EN_UNIDADES_DEL_PLANO}
      fontWeight={600}
      textAnchor="middle"
      dominantBaseline="central"
      fill={COLOR}
    >
      {lotes.map((lote) => (
        <text
          key={lote.id}
          x={lote.centroide[0]}
          y={lote.centroide[1]}
          opacity={filtro !== null && lote.estado !== filtro ? 0.3 : 1}
        >
          {lote.numero}
        </text>
      ))}
    </g>
  )
}

/**
 * Se memoiza y depende solo de la escala, no del desplazamiento: así arrastrar
 * el plano no vuelve a dibujar los 462 textos.
 */
export const EtiquetasLotes = memo(EtiquetasLotesBase)
