import { useId, useState } from 'react'

import { ESTADOS_LOTE, PRESENTACION_ESTADO, type EstadoLote } from '@/lib/plano/estado'

interface Props {
  readonly estado: EstadoLote
  readonly onCambiar: (estado: EstadoLote) => Promise<void>
}

/** Cambio de estado en un paso, sin abrir el formulario completo. */
export const SelectorEstadoRapido = ({ estado, onCambiar }: Props) => {
  const idCampo = useId()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cambiar = async (nuevo: EstadoLote): Promise<void> => {
    if (nuevo === estado) return

    setGuardando(true)
    setError(null)

    try {
      await onCambiar(nuevo)
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo cambiar el estado.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-1">
      <label htmlFor={idCampo} className="text-xs font-medium text-tierra-600">
        Cambio rápido de estado
      </label>
      <select
        id={idCampo}
        value={estado}
        disabled={guardando}
        onChange={(evento) => void cambiar(evento.target.value as EstadoLote)}
        className="w-full rounded-lg border border-tierra-300 bg-white px-3 py-3 text-base text-tierra-900 outline-none focus:border-tierra-500 focus:ring-2 focus:ring-tierra-500/20 disabled:opacity-60 sm:py-2 sm:text-sm"
      >
        {ESTADOS_LOTE.map((valor) => (
          <option key={valor} value={valor}>
            {PRESENTACION_ESTADO[valor].etiqueta}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  )
}
