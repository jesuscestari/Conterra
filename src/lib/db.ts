import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client'
import { requireEnv } from './env'

/**
 * Una sola instancia por proceso. Las funciones de Netlify reutilizan el
 * contenedor entre invocaciones cuando esta tibio, asi que guardarla en el
 * ambito global evita abrir un pool nuevo en cada llamada.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

/**
 * Se usa el driver de node-postgres y no el HTTP de Neon porque las funciones
 * corren en el runtime de Node. Si alguna vez alguna pasa a edge, ahi si
 * conviene `@prisma/adapter-neon`.
 *
 * `DATABASE_URL` tiene que ser la conexion pooleada: la app abre y cierra
 * conexiones seguido y Postgres no tolera bien esa rotacion sin un pooler
 * delante. Las migraciones van por `DIRECT_URL` (ver `prisma.config.ts`).
 */
const createPrismaClient = (): PrismaClient => {
  const adapter = new PrismaPg({ connectionString: requireEnv('DATABASE_URL') })

  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
