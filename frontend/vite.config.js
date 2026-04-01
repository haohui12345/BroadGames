import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendOrigin = (env.VITE_API_URL || 'https://localhost:3000/api').replace(/\/api\/?$/, '')
  const certPath = path.resolve(__dirname, '../backend/certs/localhost.pfx')
  const httpsConfig = fs.existsSync(certPath)
    ? {
        pfx: fs.readFileSync(certPath),
        passphrase: env.VITE_SSL_PFX_PASSPHRASE || 'boardgame-dev-cert',
      }
    : undefined

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
      https: httpsConfig,
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
