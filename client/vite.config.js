import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// What da frontend connects to (da backend port)
/*
When your React app makes a request to /api/auth/login
Vite redirects it to http://localhost:5001/api/auth/login
No CORS issues
*/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  }
})