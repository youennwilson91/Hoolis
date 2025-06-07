import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import mkcert from 'vite-plugin-mkcert' // Désactivé pour le développement HTTP

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // mkcert() // Désactivé pour utiliser HTTP en développement
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['gsap', '@gsap/react'],
          utils: ['axios', 'zustand']
        }
      }
    },
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  server: {
    https: false, // Désactive HTTPS pour le développement
    host: true,   // Permet l'accès depuis le réseau local
    port: 5173    // Port par défaut
  }
})
