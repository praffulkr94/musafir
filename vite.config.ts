import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // MapLibre ships a module worker that the dep optimizer cannot rewrite; serve it as-is.
    exclude: ['maplibre-gl'],
  },
})
