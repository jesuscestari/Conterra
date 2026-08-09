import 'dotenv/config'

import { prisma } from '@/lib/db'

import { sembrarAdmin } from './seed/admin'
import { leerGeometria } from './seed/geometria'
import { sembrarLotes } from './seed/lotes'

const reportar = (mensaje: string): void => {
  process.stdout.write(`${mensaje}\n`)
}

const sembrar = async (): Promise<void> => {
  const limpiarHuerfanos = process.argv.includes('--limpiar-huerfanos')

  reportar(await sembrarAdmin())

  const geometria = await leerGeometria()
  const { creados, huerfanos, huerfanosBorrados } = await sembrarLotes(geometria, {
    limpiarHuerfanos,
  })

  reportar(`Lotes creados: ${creados}`)
  reportar('Los lotes que ya existían no se tocaron: su número puede estar corregido a mano.')

  if (huerfanosBorrados > 0) {
    reportar(`Lotes huérfanos borrados: ${huerfanosBorrados}`)
    return
  }

  if (huerfanos.length > 0) {
    reportar(
      `Atención: ${huerfanos.length} lotes en la base ya no existen en el plano ` +
        `(${huerfanos.slice(0, 5).join(', ')}${huerfanos.length > 5 ? ', ...' : ''}). ` +
        'Se dejan intactos para no perder sus datos comerciales. Si el plano cambió ' +
        'de verdad, borralos con: npm run db:seed -- --limpiar-huerfanos',
    )
  }
}

sembrar()
  .catch((error: unknown) => {
    process.stderr.write(
      `\nFalló el seed: ${error instanceof Error ? error.message : String(error)}\n`,
    )
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
