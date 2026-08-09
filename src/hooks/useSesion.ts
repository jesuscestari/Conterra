import { useCallback, useEffect, useState } from 'react'

import { pedirJson } from '@/lib/api/cliente'
import type { AdminSesion } from '@/lib/auth/sesion'

interface RespuestaSesion {
  readonly admin: AdminSesion | null
}

export interface EstadoSesion {
  readonly admin: AdminSesion | null
  readonly cargando: boolean
  readonly salir: () => Promise<void>
}

/** Sesion del administrador. Ante cualquier fallo se asume visita anonima. */
export const useSesion = (): EstadoSesion => {
  const [admin, setAdmin] = useState<AdminSesion | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let vigente = true

    const cargar = async (): Promise<void> => {
      try {
        const { admin: actual } = await pedirJson<RespuestaSesion>('/api/auth/sesion')

        if (vigente) setAdmin(actual)
      } catch {
        if (vigente) setAdmin(null)
      } finally {
        if (vigente) setCargando(false)
      }
    }

    void cargar()

    return () => {
      vigente = false
    }
  }, [])

  const salir = useCallback(async () => {
    try {
      await pedirJson('/api/auth/logout', { method: 'POST' })
    } finally {
      setAdmin(null)
    }
  }, [])

  return { admin, cargando, salir }
}
