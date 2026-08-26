import { useCallback, useMemo, useState } from 'react'

import { BarraAdmin } from '@/components/auth/BarraAdmin'
import { PanelCategorias } from '@/components/categorias/PanelCategorias'
import { calcularAnclaje } from '@/components/lote/anclaje'
import { PopupLote } from '@/components/lote/PopupLote'
import { useEsPantallaChica } from '@/hooks/useMediaQuery'
import { usePlano } from '@/hooks/usePlano'
import { useSesion } from '@/hooks/useSesion'
import { useVistaMapa } from '@/hooks/useVistaMapa'
import { contarPorCategoria, contarPorEstado } from '@/lib/lotes/conteos'
import { numerosDuplicados } from '@/lib/lotes/duplicados'
import type { LoteCompleto } from '@/lib/lotes/tipos'
import type { EstadoLote } from '@/lib/plano/estado'

import { BuscadorLote } from './BuscadorLote'
import { ControlesZoom } from './ControlesZoom'
import { Leyenda } from './Leyenda'
import { LeyendaPrecios } from './LeyendaPrecios'
import { LienzoPlano } from './LienzoPlano'

interface Props {
  /** Imagen de fondo del plano, la misma que se vectorizo. */
  readonly rutaImagen: string
}

/** Zoom al que se salta cuando se elige un lote desde el buscador. */
const ZOOM_AL_BUSCAR = 4

export const VistaPlano = ({ rutaImagen }: Props) => {
  const {
    geometria,
    lotes,
    categorias,
    cargando,
    error,
    guardarLote,
    crearCategoria,
    guardarCategoria,
    borrarCategoria,
  } = usePlano()
  const { admin, cargando: cargandoSesion, salir } = useSesion()

  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<EstadoLote | null>(null)
  const [viendoCategorias, setViendoCategorias] = useState(false)

  const [contenedor, setContenedor] = useState<HTMLDivElement | null>(null)
  const vista = useVistaMapa(contenedor, geometria?.limites ?? null)
  const esPantallaChica = useEsPantallaChica()

  const seleccionado = useMemo(
    () => lotes.find((lote) => lote.id === seleccionadoId) ?? null,
    [lotes, seleccionadoId],
  )

  const conteos = useMemo(() => contarPorEstado(lotes), [lotes])
  const usosDeCategoria = useMemo(() => contarPorCategoria(lotes), [lotes])
  const hayPrecios = categorias.some((categoria) => categoria.precioUsd !== null)
  const duplicados = useMemo(() => numerosDuplicados(lotes), [lotes])

  const seleccionar = useCallback(
    (lote: LoteCompleto) => {
      // Un arrastre termina en un `click`; sin esta guarda se abriria el popup
      // del lote que quedo debajo del dedo al soltar.
      if (vista.fueArrastre()) return

      setSeleccionadoId(lote.id)
    },
    [vista],
  )

  const deseleccionar = useCallback(() => {
    // Mismo motivo que en `seleccionar`: arrastrar el plano no debería cerrar
    // el popup que está abierto.
    if (vista.fueArrastre()) return

    setSeleccionadoId(null)
  }, [vista])

  const irAlLote = useCallback(
    (lote: LoteCompleto) => {
      vista.centrarEn(lote.centroide, ZOOM_AL_BUSCAR)
      setSeleccionadoId(lote.id)
    },
    [vista],
  )

  const guardar = useCallback(
    async (cambios: Parameters<typeof guardarLote>[1]) => {
      if (!seleccionadoId) return

      await guardarLote(seleccionadoId, cambios)
    },
    [guardarLote, seleccionadoId],
  )

  /**
   * En pantalla chica el popup sube como hoja desde abajo y no necesita
   * anclaje. En pantalla grande se ancla al lote, corregido para no salirse.
   */
  const anclajePopup = useMemo(() => {
    if (!seleccionado || esPantallaChica || !vista.medidasContenedor) return null

    return calcularAnclaje(vista.aPantalla(seleccionado.centroide), vista.medidasContenedor)
  }, [seleccionado, esPantallaChica, vista])

  return (
    <div className="plano flex h-dvh flex-col bg-tierra-50">
      <header className="z-30 flex flex-wrap items-center gap-x-3 gap-y-2 border-b-2 border-tierra-500 bg-white/85 px-3 py-2 backdrop-blur sm:px-4 sm:py-3">
        <div className="order-1 mr-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="h-8 w-1 shrink-0 rounded-full bg-tierra-500 sm:h-9" aria-hidden />
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-tierra-900 sm:text-lg">
              El Madrigal
            </h1>
            <p className="truncate text-[11px] text-tierra-600 sm:text-xs">
              Zárate · Plano de lotes
            </p>
          </div>
        </div>

        {/* En pantalla chica el buscador baja a su propia línea, así el título
            y el acceso quedan juntos arriba y el mapa gana alto. */}
        <div className="order-3 w-full sm:order-2 sm:w-auto">
          <BuscadorLote lotes={lotes} onElegir={irAlLote} />
        </div>

        <div className="order-2 flex shrink-0 items-center gap-2 sm:order-3">
          {admin ? (
            <button
              type="button"
              onClick={() => setViendoCategorias((abierto) => !abierto)}
              aria-pressed={viendoCategorias}
              className="rounded-full border border-tierra-400 bg-white/80 px-3 py-2 text-sm font-medium text-tierra-700 transition hover:border-tierra-500 hover:bg-tierra-50"
            >
              Categorías
            </button>
          ) : null}
          <BarraAdmin admin={admin} cargando={cargandoSesion} onSalir={salir} />
        </div>
      </header>

      <div className="flex items-center gap-3 border-b border-tierra-200 bg-tierra-50/80 py-2 pl-3 pr-3 sm:px-4">
        {/* Los chips no se apilan: se deslizan en horizontal, que ocupa una sola
            línea y no le come alto al plano. */}
        {/* Los estados y los precios comparten la tira que se desliza: son dos
            lecturas de lo mismo y separarlas en dos filas le come alto al plano. */}
        <div className="-ml-3 flex-1 overflow-x-auto pl-3 sm:ml-0 sm:pl-0">
          <div className="flex w-max items-center gap-3">
            <LeyendaPrecios categorias={categorias} />

            {/* La condición mira si hay algún precio, no si hay categorías: una
                categoría sin precio no dibuja nada, y el separador quedaría
                suelto al principio de la tira. */}
            {hayPrecios ? (
              <span className="h-5 w-px shrink-0 bg-tierra-200" aria-hidden />
            ) : null}

            <Leyenda conteos={conteos} filtro={filtro} onFiltrar={setFiltro} />
          </div>
        </div>
        {admin && duplicados.length > 0 ? (
          <span
            title={`Números repetidos: ${duplicados.join(', ')}`}
            className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 ring-1 ring-inset ring-amber-600/30"
          >
            {duplicados.length} número{duplicados.length > 1 ? 's' : ''} repetido
            {duplicados.length > 1 ? 's' : ''}
          </span>
        ) : null}

        <span className="hidden shrink-0 text-xs text-tierra-600 sm:inline">
          {lotes.length} lotes
        </span>
      </div>

      <main className="relative flex-1 overflow-hidden">
        {error ? (
          <p className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center text-sm text-rose-800">
            {error}
          </p>
        ) : null}

        {cargando ? (
          <p className="absolute inset-0 z-10 flex items-center justify-center text-sm text-tierra-600">
            Cargando el plano…
          </p>
        ) : null}

        {geometria ? (
          <>
            <LienzoPlano
              geometria={geometria}
              lotes={lotes}
              seleccionadoId={seleccionadoId}
              filtro={filtro}
              vista={vista}
              refContenedor={setContenedor}
              rutaImagen={rutaImagen}
              onSeleccionar={seleccionar}
              onDeseleccionar={deseleccionar}
            />

            {admin && viendoCategorias ? (
              <PanelCategorias
                categorias={categorias}
                usos={usosDeCategoria}
                onCrear={crearCategoria}
                onGuardar={guardarCategoria}
                onBorrar={borrarCategoria}
                onCerrar={() => setViendoCategorias(false)}
              />
            ) : null}

            <ControlesZoom
              onAcercar={vista.acercar}
              onAlejar={vista.alejar}
              onAjustar={vista.ajustar}
              elevado={seleccionado !== null && esPantallaChica}
            />

            {seleccionado ? (
              <PopupLote
                key={seleccionado.id}
                lote={seleccionado}
                categorias={categorias}
                esAdmin={admin !== null}
                anclaje={anclajePopup}
                onGuardar={guardar}
                onCerrar={() => setSeleccionadoId(null)}
              />
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  )
}
