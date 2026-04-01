import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendOrigin = (env.VITE_API_URL || 'https://localhost:3000/api').replace(/\/api\/?$/, '')

  // Read SSL certificates for HTTPS
  const certPath = path.resolve(__dirname, '../backend/localhost.pem')
  const keyPath = path.resolve(__dirname, '../backend/localhost-key.pem')
  const https = fs.existsSync(certPath) && fs.existsSync(keyPath)
    ? {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    : false

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      https,
      proxy: {
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: backendOrigin,
          changeOrigin: true,
          ws: true,
          secure: false,
        },
      },
    },
  }
})
