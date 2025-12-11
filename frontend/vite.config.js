


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react() , tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:2018',
        changeOrigin: true,
      },
      '/scan': {
        target: 'http://localhost:2018',
        changeOrigin: true,
      },
      // WebSocket proxy
      '/ws': {
        target: 'ws://localhost:2018',
        ws: true,
      }
    }
  }
})