import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Three.js is inherently ~1.2 MB minified; it is lazy-loaded in its own chunk, so the warning is noise.
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        // Keep the heavy 3D stack in its own chunk so the HTML/CSS shell paints first.
        manualChunks(id: string) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three'
        },
      },
    },
  },
})
