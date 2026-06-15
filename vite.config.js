import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Vite 8 dropped legacy `module` field support; lucide-react 1.x has no
      // `exports` map. Alias to the CJS build so Vite can pre-bundle it as ESM.
      'lucide-react': path.resolve(
        __dirname,
        'node_modules/lucide-react/dist/cjs/lucide-react.js'
      ),
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
})
