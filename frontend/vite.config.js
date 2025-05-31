import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert() // Génère automatiquement des certificats SSL pour le développement
  ],
  server: {
    https: true, // Active HTTPS
    host: true,  // Permet l'accès depuis le réseau local
    port: 5173   // Port par défaut
  }
})
