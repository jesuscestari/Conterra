import { memo } from 'react'

import type { LoteCompleto } from '@/lib/lotes/tipos'
import { colorDeLote } from '@/lib/lotes/colorDeLote'
import { PRESENTACION_ESTADO } from '@/lib/plano/estado'

interface Props {
  readonly lote: LoteCompleto
  readonly seleccionado: boolean
  readonly atenuado: boolean
  readonly onSeleccionar: (lote: LoteCompleto) => void
}

const aCadenaDePuntos = (puntos: LoteCompleto['puntos']): string =>
  puntos.map(([x, y]) => `${x},${y}`).join(' ')

const PoligonoLoteBase = ({ lote, seleccionado, atenuado, onSeleccionar }: Props) => {
  const presentacion = colorDeLote(lote)

  return (
    <polygon
      points={aCadenaDePuntos(lote.puntos)}
      fill={seleccionado ? presentacion.rellenoActivo : presentacion.relleno}
      fillOpacity={atenuado ? 0.25 : 1}
      stroke={seleccionado ? '#ffffff' : '#1d2a15'}
      strokeWidth={seleccionado ? 1.6 : 0.35}
      strokeLinejoin="round"
      // `outline-none` va sin condición: el anillo de foco propio de Chrome es
      // un contorno negro grueso que sigue la forma del polígono y queda
      // pésimo sobre el plano. En su lugar, el foco por teclado pinta el mismo
      // borde blanco que ya usa el lote seleccionado, así el indicador existe
      // pero es el nuestro.
      className="cursor-pointer outline-none transition-[fill,fill-opacity] duration-150 hover:brightness-115 focus-visible:[stroke-width:1.6] focus-visible:[stroke:#ffffff]"
      tabIndex={0}
      role="button"
      aria-label={`Lote ${lote.numero}, ${PRESENTACION_ESTADO[lote.estado].etiqueta}`}
      onClick={(evento) => {
        evento.stopPropagation()
        onSeleccionar(lote)
      }}
      onKeyDown={(evento) => {
        if (evento.key !== 'Enter' && evento.key !== ' ') return

        evento.preventDefault()
        onSeleccionar(lote)
      }}
    />
  )
}

/**
 * Se memoiza porque el plano dibuja cientos de poligonos y cualquier cambio de
 * desplazamiento o de zoom volveria a renderizarlos a todos.
 */
export const PoligonoLote = memo(PoligonoLoteBase)
