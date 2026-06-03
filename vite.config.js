import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Keep the base path for GitHub Pages compatibility
  base: process.env.NODE_ENV === 'production' ? '/loc34-frontend/' : '/',
  server: {
    allowedHosts: 'all',
    host: true,
    port: 5173,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('pages/Admin/')) {
            return 'admin-chunk';
          }
        }
      }
    }
  }
})