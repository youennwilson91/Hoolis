import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import mkcert from 'vite-plugin-mkcert' // Désactivé pour le développement HTTP

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // mkcert() // Désactivé pour utiliser HTTP en développement
  ],
  // Configuration pour le déploiement
  base: './',
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
    chunkSizeWarningLimit: 1000,
    // Configuration pour les assets
    assetsDir: 'assets',
    outDir: 'dist'
  },
  server: {
    https: false, // Désactive HTTPS pour le développement
    host: true,   // Permet l'accès depuis le réseau local
    port: 5173    // Port par défaut
  },
  // Configuration pour la production
  preview: {
    port: 4173,
    host: true
  }
})
