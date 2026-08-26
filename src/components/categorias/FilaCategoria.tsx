import { useState } from 'react'

import type { ActualizacionCategoria } from '@/lib/categorias/esquemas'
import type { CategoriaDatos } from '@/lib/categorias/tipos'
import { formatearPrecio } from '@/lib/formato'

interface Props {
  readonly categoria: CategoriaDatos
  readonly lotesQueLaUsan: number
  readonly onGuardar: (cambios: ActualizacionCategoria) => Promise<void>
  readonly onBorrar: () => Promise<void>
}

const claseCampo =
  'rounded-lg border border-tierra-200 bg-white px-2 py-1.5 text-sm text-tierra-900 outline-none focus:border-tierra-500 focus:ring-2 focus:ring-tierra-500/20'

export const FilaCategoria = ({ categoria, lotesQueLaUsan, onGuardar, onBorrar }: Props) => {
  const [nombre, setNombre] = useState(categoria.nombre)
  const [color, setColor] = useState(categoria.color)
  const [precio, setPrecio] = useState(
    categoria.precioUsd === null ? '' : String(categoria.precioUsd),
  )
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sinCambios =
    nombre === categoria.nombre &&
    color === categoria.color &&
    precio === (categoria.precioUsd === null ? '' : String(categoria.precioUsd))

  const ejecutar = async (accion: () => Promise<void>): Promise<void> => {
    setOcupado(true)
    setError(null)

    try {
      await accion()
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo completar la acción.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <li className="rounded-lg border border-tierra-200 bg-white/70 p-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(evento) => setColor(evento.target.value)}
          aria-label={`Color de ${categoria.nombre}`}
          className="size-9 shrink-0 cursor-pointer rounded border border-tierra-200 bg-white p-0.5"
        />

        <input
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          aria-label={`Nombre de ${categoria.nombre}`}
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
          aria-label={`Precio de ${categoria.nombre}`}
          className={`${claseCampo} w-32 shrink-0`}
        />

        <span className="shrink-0 text-xs text-tierra-600">
          {lotesQueLaUsan} {lotesQueLaUsan === 1 ? 'lote' : 'lotes'}
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={ocupado || sinCambios}
            onClick={() =>
              void ejecutar(() =>
                onGuardar({
                  nombre,
                  color,
                  precioUsd: precio.trim() === '' ? null : Math.round(Number(precio)),
                }),
              )
            }
            className="rounded-md bg-tierra-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-tierra-700 disabled:opacity-40"
          >
            Guardar
          </button>

          {/* Borrar una categoria en uso dejaria sin precio ni color a sus
              lotes, asi que el boton ni siquiera se ofrece: primero hay que
              reasignarlos. El servidor lo vuelve a verificar igual. */}
          <button
            type="button"
            disabled={ocupado || lotesQueLaUsan > 0}
            title={
              lotesQueLaUsan > 0
                ? `La usan ${lotesQueLaUsan} lotes. Asignales otra categoría primero.`
                : 'Borrar'
            }
            onClick={() => void ejecutar(onBorrar)}
            className="rounded-md px-2 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-30"
          >
            Borrar
          </button>
        </div>
      </div>

      {categoria.precioUsd !== null ? (
        <p className="mt-1 text-[11px] text-tierra-600">
          Sus {lotesQueLaUsan} lotes muestran {formatearPrecio(categoria.precioUsd)}.
        </p>
      ) : null}

      {error ? <p className="mt-1 text-xs text-rose-700">{error}</p> : null}
    </li>
  )
}
