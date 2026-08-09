import { useMemo, useState } from 'react'

import type { LoteCompleto } from '@/lib/lotes/tipos'
import { formatearSuperficie } from '@/lib/formato'
import { PRESENTACION_ESTADO } from '@/lib/plano/estado'

interface Props {
  readonly lotes: readonly LoteCompleto[]
  readonly onElegir: (lote: LoteCompleto) => void
}

const MAXIMO_SUGERENCIAS = 6

/** Se queda solo con los dígitos: los lotes se identifican por número. */
const soloDigitos = (texto: string): string => texto.replace(/\D/g, '')

export const BuscadorLote = ({ lotes, onElegir }: Props) => {
  const [consulta, setConsulta] = useState('')

  const sugerencias = useMemo(() => {
    const termino = soloDigitos(consulta)

    if (termino.length === 0) return []

    // Coincidencia por prefijo y no por "contiene": quien escribe 13 busca el
    // lote 13 y los 13x, no el 213.
    return lotes
      .filter((lote) => String(lote.numero).startsWith(termino))
      .sort((a, b) => a.numero - b.numero)
      .slice(0, MAXIMO_SUGERENCIAS)
  }, [consulta, lotes])

  const elegir = (lote: LoteCompleto): void => {
    setConsulta('')
    onElegir(lote)
  }

  return (
    <div className="relative w-full sm:w-64">
      <input
        type="search"
        value={consulta}
        onChange={(evento) => setConsulta(evento.target.value)}
        inputMode="numeric"
        placeholder="Buscar lote por número"
        aria-label="Buscar lote por número"
        className="w-full rounded-full border border-tierra-200 bg-white/90 px-4 py-2.5 text-base text-tierra-900 outline-none placeholder:text-tierra-500 focus:border-tierra-500 focus:ring-2 focus:ring-tierra-500/20 sm:py-2 sm:text-sm"
      />

      {sugerencias.length > 0 ? (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-tierra-200 bg-white shadow-lg">
          {sugerencias.map((lote) => (
            <li key={lote.id}>
              <button
                type="button"
                onClick={() => elegir(lote)}
                className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm transition hover:bg-tierra-50 sm:py-2"
              >
                <span className="font-medium text-tierra-900">Lote {lote.numero}</span>
                <span className="flex items-center gap-2 text-xs text-tierra-600">
                  {formatearSuperficie(lote.superficieM2)}
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: PRESENTACION_ESTADO[lote.estado].relleno }}
                    aria-hidden
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
