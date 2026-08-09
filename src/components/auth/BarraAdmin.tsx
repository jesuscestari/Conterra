import { Link } from 'react-router-dom'

import type { AdminSesion } from '@/lib/auth/sesion'

interface Props {
  readonly admin: AdminSesion | null
  readonly cargando: boolean
  readonly onSalir: () => Promise<void>
}

export const BarraAdmin = ({ admin, cargando, onSalir }: Props) => {
  if (cargando) return <span className="text-sm text-tierra-600">…</span>

  if (!admin) {
    return (
      <Link
        to="/admin"
        className="rounded-full border border-tierra-400 bg-white/80 px-4 py-2 text-sm font-medium text-tierra-700 transition hover:border-tierra-500 hover:bg-tierra-50"
      >
        Ingresar
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-tierra-600 sm:inline">
        Editando como <strong className="font-medium text-tierra-900">{admin.nombre}</strong>
      </span>
      <button
        type="button"
        onClick={() => void onSalir()}
        className="rounded-full border border-tierra-400 bg-white/80 px-4 py-2 text-sm font-medium text-tierra-700 transition hover:border-tierra-500 hover:bg-tierra-50"
      >
        Salir
      </button>
    </div>
  )
}
