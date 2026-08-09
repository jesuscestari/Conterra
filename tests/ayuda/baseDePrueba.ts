import { createServer } from 'node:net'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'

const CARPETA_MIGRACIONES = join(process.cwd(), 'prisma', 'migrations')

const HOST = '127.0.0.1'

/** El pool de `pg` abre hasta 10 conexiones por defecto; el servidor las acepta todas. */
const MAXIMO_CONEXIONES = 10

/** Las migraciones se aplican en orden alfabetico, que es el cronologico. */
const migracionesEnOrden = (): readonly string[] =>
  readdirSync(CARPETA_MIGRACIONES, { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => join(CARPETA_MIGRACIONES, entrada.name, 'migration.sql'))
    .sort()

/**
 * Pide al sistema un puerto libre y lo devuelve.
 *
 * `PGLiteSocketServer` acepta `port: 0` pero despues no informa cual le toco,
 * asi que hay que elegirlo de antemano. Entre que se cierra este servidor y
 * arranca el de PGlite hay una ventana en la que otro proceso podria tomarlo;
 * es aceptable porque los archivos de test corren en serie.
 */
const puertoLibre = async (): Promise<number> =>
  new Promise((resolver, rechazar) => {
    const sonda = createServer()

    sonda.once('error', rechazar)
    sonda.listen(0, HOST, () => {
      const direccion = sonda.address()

      if (direccion === null || typeof direccion === 'string') {
        sonda.close(() => rechazar(new Error('No se pudo reservar un puerto para la base.')))
        return
      }

      sonda.close(() => resolver(direccion.port))
    })
  })

export interface BaseDePrueba {
  readonly url: string
  readonly cerrar: () => Promise<void>
}

/**
 * Levanta una base Postgres real para los tests y apunta `DATABASE_URL` hacia
 * ella.
 *
 * Usa PGlite, que es Postgres compilado a WebAssembly, expuesto en un puerto
 * local por el protocolo de Postgres. Asi los tests corren contra el mismo
 * motor que produccion y por el mismo adaptador (`@prisma/adapter-pg`), sin
 * pedir Docker ni un Postgres instalado.
 *
 * Se le aplican los mismos archivos de migracion que corren en produccion, de
 * modo que un desfasaje entre el esquema y las migraciones se nota aca.
 *
 * Tiene que llamarse ANTES de importar `@/lib/db`, porque ese modulo lee la
 * variable al importarse. En la practica, eso significa `await import(...)`
 * dinamico en el test.
 */
export const prepararBase = async (): Promise<BaseDePrueba> => {
  const puerto = await puertoLibre()
  const db = await PGlite.create()
  const servidor = new PGLiteSocketServer({
    db,
    port: puerto,
    host: HOST,
    maxConnections: MAXIMO_CONEXIONES,
  })

  try {
    await servidor.start()

    for (const migracion of migracionesEnOrden()) {
      await db.exec(readFileSync(migracion, 'utf8'))
    }
  } catch (error) {
    await servidor.stop().catch(() => undefined)
    await db.close().catch(() => undefined)

    throw new Error(
      `No se pudo preparar la base de prueba: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }

  // PGlite no valida credenciales, pero el driver igual necesita un usuario.
  const url = `postgres://postgres:postgres@${HOST}:${puerto}/postgres`

  process.env.DATABASE_URL = url

  return {
    url,
    cerrar: async () => {
      await servidor.stop()
      await db.close()
    },
  }
}
