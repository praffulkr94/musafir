import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // MapLibre starts its worker with `{ type: 'module' }`, so the worker bundle Vite
  // emits has to be an ES module too.
  worker: { format: 'es' },
  optimizeDeps: {
    // MapLibre ships a module worker that the dep optimizer cannot rewrite; serve it as-is.
    exclude: ['maplibre-gl'],
  },
})
