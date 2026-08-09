/**
 * Postgres local para desarrollo, sin Docker y sin tocar Neon.
 *
 * Levanta PGlite —Postgres compilado a WebAssembly— y lo expone en un puerto
 * por el protocolo de Postgres, así el driver de la aplicación se conecta igual
 * que a una base de verdad. Es el mismo motor que usan los tests de
 * integración; la diferencia es que este guarda los datos en disco, para que
 * sobrevivan entre reinicios.
 *
 * Uso:
 *   npm run db:local          # deja la base corriendo
 *   npm run db:seed           # en otra terminal, carga los 462 lotes
 *
 * La URL que hay que poner en .env es la que imprime al arrancar.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'

const HOST = '127.0.0.1'
const PUERTO = 55432
const DATOS = join(process.cwd(), '.pglite')
const MIGRACIONES = join(process.cwd(), 'prisma', 'migrations')

/** Las migraciones se aplican en orden alfabético, que es el cronológico. */
const migracionesEnOrden = (): readonly string[] =>
  readdirSync(MIGRACIONES, { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => join(MIGRACIONES, entrada.name, 'migration.sql'))
    .sort()

const arrancar = async (): Promise<void> => {
  const db = await PGlite.create({ dataDir: DATOS })
  const servidor = new PGLiteSocketServer({ db, port: PUERTO, host: HOST, maxConnections: 10 })

  await servidor.start()

  // `IF NOT EXISTS` no está en todas las sentencias de las migraciones, así que
  // al reabrir una base ya migrada esto falla. No es un problema: significa que
  // el esquema ya está puesto.
  for (const migracion of migracionesEnOrden()) {
    try {
      await db.exec(readFileSync(migracion, 'utf8'))
    } catch {
      // Ya aplicada.
    }
  }

  process.stdout.write(
    `Base local en postgres://postgres:postgres@${HOST}:${PUERTO}/postgres\n` +
      `Datos en ${DATOS}\n` +
      'Ctrl-C para parar.\n',
  )

  const parar = (): void => {
    void servidor.stop().then(() => db.close())
  }

  process.on('SIGINT', parar)
  process.on('SIGTERM', parar)
}

arrancar().catch((error: unknown) => {
  process.stderr.write(
    `No se pudo levantar la base local: ${error instanceof Error ? error.message : String(error)}\n`,
  )
  process.exitCode = 1
})
