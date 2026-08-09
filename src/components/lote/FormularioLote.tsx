import { useId, useState, type FormEvent } from 'react'

import type { ActualizacionLote } from '@/lib/lotes/esquemas'
import type { LoteCompleto } from '@/lib/lotes/tipos'
import { ESTADOS_LOTE, PRESENTACION_ESTADO, type EstadoLote } from '@/lib/plano/estado'

interface Props {
  readonly lote: LoteCompleto
  readonly onGuardar: (cambios: ActualizacionLote) => Promise<void>
  readonly onCancelar: () => void
}

interface Borrador {
  readonly estado: EstadoLote
  readonly precioUsd: string
  readonly superficieM2: string
  readonly numero: string
  readonly observacion: string
}

const aBorrador = (lote: LoteCompleto): Borrador => ({
  estado: lote.estado,
  precioUsd: lote.precioUsd === null ? '' : String(lote.precioUsd),
  superficieM2: String(lote.superficieM2),
  numero: String(lote.numero),
  observacion: lote.observacion ?? '',
})

/** El campo vacio significa "sin precio publicado", no cero. */
const aPrecio = (valor: string): number | null =>
  valor.trim() === '' ? null : Math.round(Number(valor))

// `text-base` en móvil evita que iOS haga zoom solo al enfocar el campo, y el
// alto extra da un blanco cómodo para el dedo.
const claseCampo =
  'w-full rounded-lg border border-tierra-200 bg-white px-3 py-3 text-base text-tierra-900 outline-none focus:border-tierra-500 focus:ring-2 focus:ring-tierra-500/20 sm:py-2 sm:text-sm'

export const FormularioLote = ({ lote, onGuardar, onCancelar }: Props) => {
  const idBase = useId()
  const [borrador, setBorrador] = useState<Borrador>(() => aBorrador(lote))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const actualizar = <C extends keyof Borrador>(campo: C, valor: Borrador[C]): void => {
    setBorrador((previo) => ({ ...previo, [campo]: valor }))
  }

  const enviar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault()

    const superficie = Number(borrador.superficieM2)
    const precio = aPrecio(borrador.precioUsd)
    const numero = Number(borrador.numero)

    if (!Number.isInteger(numero) || numero < 1) {
      setError('El número de lote tiene que ser un entero mayor a cero.')
      return
    }

    if (!Number.isFinite(superficie) || superficie <= 0) {
      setError('La superficie tiene que ser un número mayor a cero.')
      return
    }

    if (precio !== null && (!Number.isFinite(precio) || precio < 0)) {
      setError('El precio tiene que ser un número positivo, o quedar vacío.')
      return
    }

    setGuardando(true)
    setError(null)

    try {
      await onGuardar({
        numero,
        estado: borrador.estado,
        precioUsd: precio,
        superficieM2: superficie,
        observacion: borrador.observacion.trim() === '' ? null : borrador.observacion.trim(),
      })
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudieron guardar los cambios.')
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={(evento) => void enviar(evento)} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor={`${idBase}-numero`} className="text-xs font-medium text-tierra-600">
          Número de lote
        </label>
        <input
          id={`${idBase}-numero`}
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={borrador.numero}
          onChange={(evento) => actualizar('numero', evento.target.value)}
          className={claseCampo}
        />
        <p className="text-[11px] text-tierra-600">
          Según el plano de mensura. Corregilo si no coincide.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor={`${idBase}-estado`} className="text-xs font-medium text-tierra-600">
          Estado
        </label>
        <select
          id={`${idBase}-estado`}
          value={borrador.estado}
          onChange={(evento) => actualizar('estado', evento.target.value as EstadoLote)}
          className={claseCampo}
        >
          {ESTADOS_LOTE.map((valor) => (
            <option key={valor} value={valor}>
              {PRESENTACION_ESTADO[valor].etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label htmlFor={`${idBase}-precio`} className="text-xs font-medium text-tierra-600">
            Precio (USD)
          </label>
          <input
            id={`${idBase}-precio`}
            type="number"
            min={0}
            step={100}
            inputMode="numeric"
            placeholder="A consultar"
            value={borrador.precioUsd}
            onChange={(evento) => actualizar('precioUsd', evento.target.value)}
            className={claseCampo}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={`${idBase}-superficie`} className="text-xs font-medium text-tierra-600">
            Superficie (m²)
          </label>
          <input
            id={`${idBase}-superficie`}
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={borrador.superficieM2}
            onChange={(evento) => actualizar('superficieM2', evento.target.value)}
            className={claseCampo}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor={`${idBase}-observacion`} className="text-xs font-medium text-tierra-600">
          Observaciones
        </label>
        <textarea
          id={`${idBase}-observacion`}
          rows={2}
          maxLength={500}
          value={borrador.observacion}
          onChange={(evento) => actualizar('observacion', evento.target.value)}
          className={`${claseCampo} resize-none`}
        />
      </div>

      {error ? <p className="text-xs text-rose-700">{error}</p> : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={guardando}
          className="flex-1 rounded-lg bg-tierra-600 px-3 py-3 text-sm font-medium text-white transition hover:bg-tierra-700 disabled:opacity-60 sm:py-2"
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          className="rounded-lg border border-tierra-300 px-4 py-3 text-sm font-medium text-tierra-700 transition hover:bg-tierra-50 disabled:opacity-60 sm:py-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
