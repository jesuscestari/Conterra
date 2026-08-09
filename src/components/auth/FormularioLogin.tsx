import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { pedirJson } from '@/lib/api/cliente'
import { RUTA_PLANO } from '@/lib/rutas'

// `text-base` en móvil no es capricho: con menos de 16 px iOS hace zoom solo al
// enfocar el campo. El alto también sube para dar un blanco cómodo al dedo.
const claseCampo =
  'w-full rounded-lg border border-tierra-200 bg-white px-3 py-3 text-base text-tierra-900 outline-none focus:border-tierra-500 focus:ring-2 focus:ring-tierra-500/20 sm:py-2 sm:text-sm'

export const FormularioLogin = () => {
  const navegar = useNavigate()
  const idBase = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enviar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)

    try {
      await pedirJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      // Upstream hacia push + refresh porque Next cachea el render del servidor.
      // Acá alcanza con navegar: la vista del plano monta de cero y su
      // `useSesion` lee la sesión recién creada al montarse.
      navegar(RUTA_PLANO)
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo iniciar sesión.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={(evento) => void enviar(evento)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor={`${idBase}-email`} className="text-sm font-medium text-tierra-800">
          Email
        </label>
        <input
          id={`${idBase}-email`}
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          className={claseCampo}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor={`${idBase}-password`} className="text-sm font-medium text-tierra-800">
          Contraseña
        </label>
        <input
          id={`${idBase}-password`}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
          className={claseCampo}
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-rose-50 p-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-tierra-600 px-3 py-3 text-sm font-medium text-white transition hover:bg-tierra-700 disabled:opacity-60 sm:py-2.5"
      >
        {enviando ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}
