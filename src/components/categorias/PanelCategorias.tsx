import { useState } from 'react'

import type { ActualizacionCategoria, NuevaCategoria } from '@/lib/categorias/esquemas'
import type { CategoriaDatos } from '@/lib/categorias/tipos'

import { FilaCategoria } from './FilaCategoria'

interface Props {
  readonly categorias: readonly CategoriaDatos[]
  /** Cuántos lotes usa cada categoría, por id. */
  readonly usos: Readonly<Record<string, number>>
  readonly onCrear: (datos: NuevaCategoria) => Promise<void>
  readonly onGuardar: (id: string, cambios: ActualizacionCategoria) => Promise<void>
  readonly onBorrar: (id: string) => Promise<void>
  readonly onCerrar: () => void
}

/** Color de arranque de una categoría nueva: un neutro que no se parece a ninguna. */
const COLOR_INICIAL = '#d4d4d4'

const claseCampo =
  'rounded-lg border border-tierra-200 bg-white px-2 py-1.5 text-sm text-tierra-900 outline-none focus:border-tierra-500 focus:ring-2 focus:ring-tierra-500/20'

export const PanelCategorias = ({
  categorias,
  usos,
  onCrear,
  onGuardar,
  onBorrar,
  onCerrar,
}: Props) => {
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState(COLOR_INICIAL)
  const [precio, setPrecio] = useState('')
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crear = async (): Promise<void> => {
    setCreando(true)
    setError(null)

    try {
      await onCrear({
        nombre,
        color,
        precioUsd: precio.trim() === '' ? null : Math.round(Number(precio)),
        // Al final de la lista, que es donde uno espera que aparezca lo nuevo.
        orden: categorias.reduce((mayor, categoria) => Math.max(mayor, categoria.orden), 0) + 1,
      })

      setNombre('')
      setColor(COLOR_INICIAL)
      setPrecio('')
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo crear la categoría.')
    } finally {
      setCreando(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Categorías"
      className="absolute inset-x-3 top-3 z-40 max-h-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-tierra-200 bg-white/95 shadow-xl backdrop-blur sm:inset-x-auto sm:right-4 sm:w-[34rem]"
    >
      <div className="h-1 bg-tierra-500" aria-hidden />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-tierra-900">Categorías</h2>
            <p className="text-xs text-tierra-600">
              El precio y el color de cada lote salen de acá. Cambiar el precio de una categoría
              lo cambia en todos sus lotes.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-m-1 flex size-9 shrink-0 items-center justify-center rounded-md text-tierra-600 transition hover:bg-tierra-50 hover:text-tierra-900 sm:size-7"
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul className="mt-3 space-y-2">
          {categorias.map((categoria) => (
            <FilaCategoria
              key={categoria.id}
              categoria={categoria}
              lotesQueLaUsan={usos[categoria.id] ?? 0}
              onGuardar={(cambios) => onGuardar(categoria.id, cambios)}
              onBorrar={() => onBorrar(categoria.id)}
            />
          ))}
        </ul>

        {categorias.length === 0 ? (
          <p className="mt-3 text-sm text-tierra-600">Todavía no hay categorías.</p>
        ) : null}

        <div className="mt-4 border-t border-tierra-200 pt-3">
          <h3 className="text-xs font-medium text-tierra-600">Nueva categoría</h3>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(evento) => setColor(evento.target.value)}
              aria-label="Color de la categoría nueva"
              className="size-9 shrink-0 cursor-pointer rounded border border-tierra-200 bg-white p-0.5"
            />
            <input
              value={nombre}
              placeholder="Nombre"
              onChange={(evento) => setNombre(evento.target.value)}
              aria-label="Nombre de la categoría nueva"
              className={`${claseCampo} w-28 shrink-0`}
            />
            <input
              type="number"
              min={0}
              step={100}
              inputMode="numeric"
              placeholder="Sin precio"
              value={precio}
              onChange={(evento) => setPrecio(evento.target.value)}
              aria-label="Precio de la categoría nueva"
              className={`${claseCampo} w-32 shrink-0`}
            />
            <button
              type="button"
              disabled={creando || nombre.trim() === ''}
              onClick={() => void crear()}
              className="ml-auto rounded-md bg-tierra-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-tierra-700 disabled:opacity-40"
            >
              Agregar
            </button>
          </div>

          {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
        </div>
      </div>
    </div>
  )
}
