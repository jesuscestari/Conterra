import { useEffect, useState } from 'react'

import type { ActualizacionLote } from '@/lib/lotes/esquemas'
import type { LoteCompleto } from '@/lib/lotes/tipos'
import { formatearFecha, formatearPrecio, formatearSuperficie } from '@/lib/formato'
import { precioEsPublico } from '@/lib/lotes/reglas'
import { PRESENTACION_ESTADO, type EstadoLote } from '@/lib/plano/estado'

import { FormularioLote } from './FormularioLote'
import { SelectorEstadoRapido } from './SelectorEstadoRapido'

/**
 * En pantalla grande el popup se ancla al lote. En pantalla chica no hay lugar
 * para eso sin tapar el mapa ni salirse de los bordes, asi que sube desde abajo
 * como hoja, que ademas queda al alcance del pulgar.
 */
export interface AnclajePopup {
  readonly x: number
  readonly y: number
  /** Si el popup se dibuja por encima o por debajo del punto de anclaje. */
  readonly orientacion: 'arriba' | 'abajo'
}

interface Props {
  readonly lote: LoteCompleto
  readonly esAdmin: boolean
  readonly anclaje: AnclajePopup | null
  readonly onGuardar: (cambios: ActualizacionLote) => Promise<void>
  readonly onCerrar: () => void
}

const Dato = ({ etiqueta, valor }: { etiqueta: string; valor: string }) => (
  <div>
    <dt className="text-xs text-tierra-600">{etiqueta}</dt>
    <dd className="text-sm font-medium text-tierra-900">{valor}</dd>
  </div>
)

const CLASES_HOJA =
  'fixed inset-x-0 bottom-0 z-30 max-h-[75dvh] w-full overflow-y-auto rounded-t-2xl border-t border-tierra-200 pb-[env(safe-area-inset-bottom)] shadow-2xl'

const CLASES_ANCLADO =
  'absolute z-20 w-72 -translate-x-1/2 overflow-hidden rounded-xl border border-tierra-200 shadow-xl'

export const PopupLote = ({ lote, esAdmin, anclaje, onGuardar, onCerrar }: Props) => {
  // Quien lo monta le pasa el id del lote como `key`, asi que al saltar de un
  // lote a otro este estado se reinicia solo y vuelve la vista de lectura.
  const [editando, setEditando] = useState(false)
  const presentacion = PRESENTACION_ESTADO[lote.estado]
  const esHoja = anclaje === null

  // El precio no se publica si el lote no está a la venta, pero el admin lo
  // sigue viendo: si no, no entendería por qué desaparece lo que acaba de
  // cargar.
  const precioPublico = precioEsPublico(lote.estado)
  const mostrarPrecio = precioPublico || esAdmin

  useEffect(() => {
    const alPresionarTecla = (evento: KeyboardEvent): void => {
      if (evento.key === 'Escape') onCerrar()
    }

    window.addEventListener('keydown', alPresionarTecla)

    return () => window.removeEventListener('keydown', alPresionarTecla)
  }, [onCerrar])

  const guardarEstado = async (estado: EstadoLote): Promise<void> => {
    await onGuardar({ estado })
  }

  return (
    <div
      role="dialog"
      aria-label={`Lote ${lote.numero}`}
      style={
        anclaje
          ? {
              left: anclaje.x,
              top: anclaje.y,
              transform:
                anclaje.orientacion === 'arriba'
                  ? 'translate(-50%, -100%)'
                  : 'translate(-50%, 0)',
            }
          : undefined
      }
      onClick={(evento) => evento.stopPropagation()}
      onPointerDown={(evento) => evento.stopPropagation()}
      className={`bg-white/95 backdrop-blur ${esHoja ? CLASES_HOJA : CLASES_ANCLADO}`}
    >
      {esHoja ? (
        <div className="flex justify-center pt-2" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-tierra-300" />
        </div>
      ) : (
        // Filo de color que ata el popup a la paleta del plano.
        <div className="h-1 bg-tierra-500" aria-hidden />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-tierra-600">El Madrigal</p>
            <h2 className="text-lg font-semibold text-tierra-900">Lote {lote.numero}</h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-m-1 flex size-9 items-center justify-center rounded-md text-tierra-600 transition hover:bg-tierra-50 hover:text-tierra-900 sm:size-7"
          >
            <svg
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <span
          className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${presentacion.chip}`}
        >
          {presentacion.etiqueta}
        </span>

        {editando ? (
          <div className="mt-4">
            <FormularioLote
              lote={lote}
              onGuardar={async (cambios) => {
                await onGuardar(cambios)
                setEditando(false)
              }}
              onCancelar={() => setEditando(false)}
            />
          </div>
        ) : (
          <>
            <dl className={`mt-4 grid gap-3 ${mostrarPrecio ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <Dato etiqueta="Superficie" valor={formatearSuperficie(lote.superficieM2)} />
              {mostrarPrecio ? (
                <Dato etiqueta="Precio" valor={formatearPrecio(lote.precioUsd)} />
              ) : null}
            </dl>

            {mostrarPrecio && !precioPublico ? (
              <p className="mt-2 text-[11px] text-tierra-600">
                Las visitas no ven este precio porque el lote no está disponible.
              </p>
            ) : null}

            {lote.observacion ? (
              <p className="mt-3 rounded-lg border-l-2 border-tierra-400 bg-tierra-50 p-2 text-xs text-tierra-800">
                {lote.observacion}
              </p>
            ) : null}

            {esAdmin ? (
              <div className="mt-4 space-y-3 border-t border-tierra-200 pt-3">
                <SelectorEstadoRapido estado={lote.estado} onCambiar={guardarEstado} />
                <button
                  type="button"
                  onClick={() => setEditando(true)}
                  className="w-full rounded-lg bg-tierra-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-tierra-700"
                >
                  Editar lote
                </button>
                <p className="text-[11px] text-tierra-600">
                  Última edición: {formatearFecha(lote.editadoEn)}
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
