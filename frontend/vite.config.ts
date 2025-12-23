import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/map_info': { target: 'http://localhost:8000', changeOrigin: true },
      '/map_objects': { target: 'http://localhost:8000', changeOrigin: true },
      '/map_img': { target: 'http://localhost:8000', changeOrigin: true },
      '/gyroscope': { target: 'http://localhost:8000', changeOrigin: true },
      '/compass': { target: 'http://localhost:8000', changeOrigin: true },
      '/speed': { target: 'http://localhost:8000', changeOrigin: true },
      '/altitude': { target: 'http://localhost:8000', changeOrigin: true }
    }
  }
})
