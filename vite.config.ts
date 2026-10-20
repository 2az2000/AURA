import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Three.js is inherently ~1 MB minified. It lives in the lazily imported 3D chunk
    // (see App.tsx), so the entry bundle never pays for it; the warning is noise.
    chunkSizeWarningLimit: 1300,
  },
})
