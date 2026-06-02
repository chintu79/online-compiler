import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'a7c7-2401-4900-94f9-2ee4-b47c-d03f-c552-a6f1.ngrok-free.app'
    ],
    proxy: {
    '/api': {
      target: 'https://online-compiler-9fca.onrender.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
  },
})

