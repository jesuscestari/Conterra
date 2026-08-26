import { useCallback, useEffect, useMemo, useState } from 'react'

import { pedirJson } from '@/lib/api/cliente'
import type {
  ActualizacionCategoria,
  NuevaCategoria,
} from '@/lib/categorias/esquemas'
import type { CategoriaDatos } from '@/lib/categorias/tipos'
import type { ActualizacionLote } from '@/lib/lotes/esquemas'
import type { LoteCompleto, LoteDatos } from '@/lib/lotes/tipos'
import type { PlanoGeometria } from '@/lib/plano/tipos'

const RUTA_GEOMETRIA = '/data/plano-geometria.json'

interface RespuestaLotes {
  readonly lotes: readonly LoteDatos[]
}

interface RespuestaLote {
  readonly lote: LoteDatos
}

interface RespuestaCategorias {
  readonly categorias: readonly CategoriaDatos[]
}

interface RespuestaCategoria {
  readonly categoria: CategoriaDatos
}

export interface EstadoPlano {
  readonly geometria: PlanoGeometria | null
  readonly lotes: readonly LoteCompleto[]
  readonly categorias: readonly CategoriaDatos[]
  readonly cargando: boolean
  readonly error: string | null
  readonly guardarLote: (id: string, cambios: ActualizacionLote) => Promise<void>
  readonly crearCategoria: (datos: NuevaCategoria) => Promise<void>
  readonly guardarCategoria: (id: string, cambios: ActualizacionCategoria) => Promise<void>
  readonly borrarCategoria: (id: string) => Promise<void>
}

/**
 * Une la geometria estatica del plano con los datos comerciales de la base.
 * Solo se dibujan los lotes presentes en ambos: si la base y el plano se
 * desincronizan, es preferible mostrar de menos que dibujar un poligono sin
 * datos o un lote sin ubicacion.
 */
export const usePlano = (): EstadoPlano => {
  const [geometria, setGeometria] = useState<PlanoGeometria | null>(null)
  const [datos, setDatos] = useState<readonly LoteDatos[]>([])
  const [categorias, setCategorias] = useState<readonly CategoriaDatos[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true

    const cargar = async (): Promise<void> => {
      try {
        const [plano, { lotes }, { categorias: tramos }] = await Promise.all([
          pedirJson<PlanoGeometria>(RUTA_GEOMETRIA),
          pedirJson<RespuestaLotes>('/api/lotes'),
          pedirJson<RespuestaCategorias>('/api/categorias'),
        ])

        if (!vigente) return

        setGeometria(plano)
        setDatos(lotes)
        setCategorias(tramos)
        setError(null)
      } catch (causa) {
        if (!vigente) return

        setError(
          causa instanceof Error
            ? causa.message
            : 'No se pudo cargar el plano. Actualizá la página.',
        )
      } finally {
        if (vigente) setCargando(false)
      }
    }

    void cargar()

    return () => {
      vigente = false
    }
  }, [])

  const lotes = useMemo<readonly LoteCompleto[]>(() => {
    if (!geometria) return []

    const porId = new Map(datos.map((lote) => [lote.id, lote]))

    return geometria.lotes.flatMap((forma) => {
      const comercial = porId.get(forma.id)

      if (!comercial) return []

      return [{ ...comercial, puntos: forma.puntos, centroide: forma.centroide }]
    })
  }, [geometria, datos])

  const guardarLote = useCallback(async (id: string, cambios: ActualizacionLote) => {
    const { lote } = await pedirJson<RespuestaLote>(`/api/lotes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(cambios),
    })

    setDatos((previos) => previos.map((actual) => (actual.id === lote.id ? lote : actual)))
  }, [])

  /**
   * Vuelve a pedir los lotes despues de tocar una categoria.
   *
   * El precio y el color de cada lote salen de su categoria, asi que cambiarla
   * cambia lo que muestran todos sus lotes. Es una lectura de mas a cambio de
   * no tener que replicar en el cliente la logica de que lote usa que tramo.
   */
  const recargarLotes = useCallback(async () => {
    const { lotes } = await pedirJson<RespuestaLotes>('/api/lotes')

    setDatos(lotes)
  }, [])

  const crearCategoria = useCallback(async (nueva: NuevaCategoria) => {
    const { categoria } = await pedirJson<RespuestaCategoria>('/api/categorias', {
      method: 'POST',
      body: JSON.stringify(nueva),
    })

    setCategorias((previas) =>
      [...previas, categoria].sort(
        (una, otra) => una.orden - otra.orden || una.nombre.localeCompare(otra.nombre),
      ),
    )
  }, [])

  const guardarCategoria = useCallback(
    async (id: string, cambios: ActualizacionCategoria) => {
      const { categoria } = await pedirJson<RespuestaCategoria>(
        `/api/categorias/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify(cambios) },
      )

      setCategorias((previas) =>
        previas
          .map((actual) => (actual.id === categoria.id ? categoria : actual))
          .sort((una, otra) => una.orden - otra.orden || una.nombre.localeCompare(otra.nombre)),
      )

      await recargarLotes()
    },
    [recargarLotes],
  )

  const borrarCategoria = useCallback(async (id: string) => {
    await pedirJson(`/api/categorias/${encodeURIComponent(id)}`, { method: 'DELETE' })

    setCategorias((previas) => previas.filter((actual) => actual.id !== id))
  }, [])

  return {
    geometria,
    lotes,
    categorias,
    cargando,
    error,
    guardarLote,
    crearCategoria,
    guardarCategoria,
    borrarCategoria,
  }
}
