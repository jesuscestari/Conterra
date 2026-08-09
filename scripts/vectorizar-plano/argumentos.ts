import path from 'node:path'

import { RUTAS } from './config'

export interface ArgumentosVectorizador {
  readonly imagen: string
  readonly salida: string
  readonly previsualizacion: string
  /** Solo informa los colores dominantes y termina, sin generar geometria. */
  readonly soloDiagnostico: boolean
}

const leerOpcion = (argv: readonly string[], nombre: string): string | null => {
  const indice = argv.indexOf(`--${nombre}`)

  if (indice === -1) return null

  const valor = argv[indice + 1]

  if (!valor || valor.startsWith('--')) {
    throw new Error(`La opcion --${nombre} necesita un valor.`)
  }

  return valor
}

const resolver = (valor: string | null, porDefecto: string): string =>
  valor === null ? porDefecto : path.resolve(process.cwd(), valor)

/**
 * Opciones de linea de comandos. Permiten correr el vectorizador contra una
 * imagen distinta sin tocar la config, p. ej. el plano de prueba.
 */
export const leerArgumentos = (argv: readonly string[]): ArgumentosVectorizador => ({
  imagen: resolver(leerOpcion(argv, 'imagen'), RUTAS.imagen),
  salida: resolver(leerOpcion(argv, 'salida'), RUTAS.salida),
  previsualizacion: resolver(leerOpcion(argv, 'previsualizacion'), RUTAS.previsualizacion),
  soloDiagnostico: argv.includes('--diagnostico'),
})
