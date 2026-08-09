import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Los modulos portados del plano de lotes importan con este prefijo.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Optimizar nombres de archivos de video
          if (assetInfo.name && assetInfo.name.endsWith('.mp4')) {
            return 'assets/videos/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  assetsInclude: ['**/*.mp4'],
  optimizeDeps: {
    exclude: ['video.mp4'] // Excluir video de la optimización de dependencias
  }
})
