import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://tourism-j3nz.onrender.com',
        changeOrigin: true,
        // No rewrite — Django expects the full /api/... path
      }
    }
  }
})
