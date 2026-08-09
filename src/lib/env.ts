/**
 * Lectura de variables de entorno que falla temprano y con un mensaje claro,
 * en vez de romper mas adelante con un `undefined` silencioso.
 */
export const requireEnv = (name: string): string => {
  const value = process.env[name]

  if (!value || value.trim().length === 0) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copiá .env.example a .env y completala.`,
    )
  }

  return value
}
