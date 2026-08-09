import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // Node por defecto; los tests de interfaz piden jsdom con un comentario
    // `@vitest-environment` en su encabezado.
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    // Los tests de integracion levantan cada uno su propio Postgres (PGlite) en
    // un puerto local: en serie son mas rapidos y no compiten por puertos.
    fileParallelism: false,
  },
})
