export default {
  // URL de base de votre application (à adapter selon votre environnement)
  site: 'https://dev-hoolis-frontend.onrender.com', // ou 'http://localhost:5173' pour le dev local
  
  // Scanner toutes les pages automatiquement
  scanner: {
    // Découvrir automatiquement les pages via sitemap et liens
    sitemap: false,
    robotsTxt: false,
    // Définir manuellement les routes à analyser
    samples: [
      '/',           // Landing page
      '/fw',         // FandW page  
      '/gallery',    // Gallery page
      '/hoolis',     // Shop page
      // '/about',   // Décommentez si vous activez cette route
    ],
  },
  
  // Configuration des rapports
  outputPath: '.unlighthouse',
  
  // Options Lighthouse
  lighthouseOptions: {
    // Analyser sur mobile et desktop
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
  
  // Configuration du navigateur
  puppeteerOptions: {
    // Attendre que la page soit entièrement chargée (important pour les SPA)
    waitUntil: 'networkidle0',
  },
  
  // Hooks pour les SPA React
  hooks: {
    // Attendre que React soit chargé
    'page:before-goto': async (page) => {
      // Attendre un peu plus pour les applications React
      await page.waitForTimeout(2000);
    },
  },
  
  // Servir les résultats sur un port spécifique
  server: {
    port: 7331,
  },
}
