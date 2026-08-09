interface Props {
  readonly onAcercar: () => void
  readonly onAlejar: () => void
  readonly onAjustar: () => void
  /** Corre los controles para que no queden tapados por la hoja del lote. */
  readonly elevado: boolean
}

// En pantalla chica los botones son más grandes: 36 px es un blanco incómodo
// para el dedo.
const claseBoton =
  'flex size-11 items-center justify-center rounded-lg bg-white/90 text-tierra-700 shadow ring-1 ring-tierra-300 transition hover:bg-tierra-50 hover:text-tierra-900 sm:size-9'

export const ControlesZoom = ({ onAcercar, onAlejar, onAjustar, elevado }: Props) => (
  // Con la hoja abierta los controles saltan arriba en vez de intentar
  // esquivarla: el alto de la hoja depende del contenido, así que cualquier
  // desplazamiento calculado quedaría mal en algún caso.
  <div
    className={`absolute right-3 z-10 flex flex-col gap-2 sm:bottom-4 sm:right-4 sm:top-auto ${
      elevado ? 'bottom-auto top-3' : 'bottom-4 top-auto'
    }`}
  >
    <button type="button" onClick={onAcercar} aria-label="Acercar" className={claseBoton}>
      <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 4v12M4 10h12" strokeLinecap="round" />
      </svg>
    </button>
    <button type="button" onClick={onAlejar} aria-label="Alejar" className={claseBoton}>
      <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 10h12" strokeLinecap="round" />
      </svg>
    </button>
    <button
      type="button"
      onClick={onAjustar}
      aria-label="Ver el plano completo"
      className={claseBoton}
    >
      <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7V4h3M16 7V4h-3M4 13v3h3M16 13v3h-3" strokeLinecap="round" />
      </svg>
    </button>
  </div>
)
