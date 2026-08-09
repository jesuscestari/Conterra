import type { VistaMapa } from '@/hooks/useVistaMapa'
import type { LoteCompleto } from '@/lib/lotes/tipos'
import type { EstadoLote } from '@/lib/plano/estado'
import type { PlanoGeometria } from '@/lib/plano/tipos'

import { EtiquetasLotes } from './EtiquetasLotes'
import { PoligonoLote } from './PoligonoLote'

interface Props {
  readonly geometria: PlanoGeometria
  readonly lotes: readonly LoteCompleto[]
  readonly seleccionadoId: string | null
  readonly filtro: EstadoLote | null
  readonly vista: VistaMapa
  /** Callback ref: la vista necesita enterarse de cuándo aparece el contenedor. */
  readonly refContenedor: (nodo: HTMLDivElement | null) => void
  readonly rutaImagen: string
  readonly onSeleccionar: (lote: LoteCompleto) => void
  readonly onDeseleccionar: () => void
}

export const LienzoPlano = ({
  geometria,
  lotes,
  seleccionadoId,
  filtro,
  vista,
  refContenedor,
  rutaImagen,
  onSeleccionar,
  onDeseleccionar,
}: Props) => (
  <div
    ref={refContenedor}
    {...vista.manejadores}
    onClick={onDeseleccionar}
    // El sitio corre Lenis, que intercepta la rueda en window para el scroll
    // suavizado. Acá la rueda es el zoom del mapa: sin esta marca, Lenis se
    // queda el gesto y el plano no acerca.
    data-lenis-prevent
    className={`relative size-full touch-none overflow-hidden bg-tierra-100 ${
      vista.arrastrando ? 'cursor-grabbing' : 'cursor-grab'
    }`}
  >
    <div
      className="absolute left-0 top-0 origin-top-left"
      style={{
        width: geometria.ancho,
        height: geometria.alto,
        transform: `translate(${vista.transformacion.x}px, ${vista.transformacion.y}px) scale(${vista.transformacion.k})`,
        // Sin esto el navegador suaviza el plano al acercarse y se ve borroso.
        imageRendering: vista.transformacion.k > 3 ? 'pixelated' : 'auto',
      }}
    >
      <img
        src={rutaImagen}
        alt="Plano del loteo"
        width={geometria.ancho}
        height={geometria.alto}
        draggable={false}
        className="pointer-events-none absolute left-0 top-0 select-none"
      />

      <svg
        viewBox={`0 0 ${geometria.ancho} ${geometria.alto}`}
        width={geometria.ancho}
        height={geometria.alto}
        className="absolute left-0 top-0"
        // Al arrastrar se apagan los eventos de los poligonos: evita que el
        // navegador dispare hover y clicks sobre cada lote que pasa por debajo.
        style={{ pointerEvents: vista.arrastrando ? 'none' : 'auto' }}
      >
        {lotes.map((lote) => (
          <PoligonoLote
            key={lote.id}
            lote={lote}
            seleccionado={lote.id === seleccionadoId}
            atenuado={filtro !== null && lote.estado !== filtro}
            onSeleccionar={onSeleccionar}
          />
        ))}

        {/* Va después de los polígonos para quedar dibujado por encima. */}
        <EtiquetasLotes lotes={lotes} escala={vista.transformacion.k} filtro={filtro} />
      </svg>
    </div>
  </div>
)
