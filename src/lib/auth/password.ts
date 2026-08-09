import bcrypt from 'bcryptjs'

/** Costo de bcrypt. 12 rondas es el equilibrio actual entre seguridad y latencia de login. */
const RONDAS = 12

export const hashearPassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, RONDAS)
  } catch (error) {
    throw new Error(
      `No se pudo hashear la contraseña: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * Compara contra el hash guardado. Devuelve false ante cualquier error en vez
 * de propagar, para que un hash corrupto no se distinga de una clave incorrecta.
 */
export const verificarPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash)
  } catch {
    return false
  }
}
