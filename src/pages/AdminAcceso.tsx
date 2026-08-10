import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { FormularioLogin } from '@/components/auth/FormularioLogin'
import { useSesion } from '@/hooks/useSesion'
import { RUTA_PLANO } from '@/lib/rutas'

import '@/styles/plano.css'

/**
 * Marca la página como no indexable mientras está montada.
 *
 * Upstream lo resolvía con el `metadata` de Next. Acá el HTML es uno solo para
 * todo el sitio, así que se cambia al entrar y se restaura al salir.
 *
 * Se pisa la etiqueta que ya trae `index.html` en vez de agregar otra: dos
 * `meta name="robots"` con directivas opuestas dejan el resultado en manos de
 * cómo las combine cada buscador, y esto no es algo para dejar librado a eso.
 */
const useNoIndexar = (): void => {
  useEffect(() => {
    const existente = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')

    if (existente) {
      const anterior = existente.content

      existente.content = 'noindex, nofollow'

      return () => {
        existente.content = anterior
      }
    }

    const etiqueta = document.createElement('meta')

    etiqueta.name = 'robots'
    etiqueta.content = 'noindex, nofollow'
    document.head.appendChild(etiqueta)

    return () => etiqueta.remove()
  }, [])
}

const AdminAcceso = () => {
  const { admin, cargando } = useSesion()
  const navegar = useNavigate()

  useNoIndexar()

  // Con sesión abierta esta pantalla no tiene sentido: se edita desde el plano.
  useEffect(() => {
    if (!cargando && admin) navegar(RUTA_PLANO, { replace: true })
  }, [admin, cargando, navegar])

  return (
    <main className="plano flex min-h-dvh items-center justify-center bg-tierra-50 p-6 font-sans">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-tierra-200 bg-white shadow-sm">
        <div className="h-1.5 bg-tierra-500" aria-hidden />

        <div className="p-8">
          <h1 className="text-xl font-semibold tracking-tight text-tierra-900">
            Acceso de administradores
          </h1>
          <p className="mt-1 text-sm text-tierra-600">
            Ingresá para editar precios, superficies y estados de los lotes.
          </p>

          <div className="mt-6">
            <FormularioLogin />
          </div>

          <Link
            to={RUTA_PLANO}
            className="mt-6 block text-center text-sm text-tierra-600 transition hover:text-tierra-900"
          >
            Volver al plano
          </Link>
        </div>
      </div>
    </main>
  )
}

export default AdminAcceso
