import { ESTADOS_LOTE, PRESENTACION_ESTADO, type EstadoLote } from '@/lib/plano/estado'

interface Props {
  readonly conteos: Readonly<Record<EstadoLote, number>>
  readonly filtro: EstadoLote | null
  readonly onFiltrar: (estado: EstadoLote | null) => void
}

export const Leyenda = ({ conteos, filtro, onFiltrar }: Props) => (
  <div className="flex w-max items-center gap-2">
    {ESTADOS_LOTE.map((estado) => {
      const activo = filtro === estado
      const { etiqueta, relleno } = PRESENTACION_ESTADO[estado]

      return (
        <button
          key={estado}
          type="button"
          onClick={() => onFiltrar(activo ? null : estado)}
          aria-pressed={activo}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition ${
            activo
              ? 'bg-tierra-600 text-white ring-tierra-600'
              : 'bg-white/80 text-tierra-800 ring-tierra-200 hover:bg-white hover:ring-tierra-400'
          }`}
        >
          <span
            className="size-3 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: relleno }}
            aria-hidden
          />
          {etiqueta}
          <span className={activo ? 'text-white/80' : 'text-tierra-600'}>{conteos[estado]}</span>
        </button>
      )
    })}
  </div>
)
