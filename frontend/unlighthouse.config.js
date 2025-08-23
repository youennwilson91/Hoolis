module.exports = {
  site: 'https://dev-hoolis-frontend.onrender.com',
  
  // Utiliser 'urls' au lieu de 'scanner.samples'
  urls: [
    '/',
    '/fw', 
    '/gallery',
    '/hoolis'
  ],
  
  // Configuration des rapports
  outputPath: '.unlighthouse',
  
  // Options Lighthouse
  lighthouseOptions: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
  
  // Configuration du navigateur
  puppeteerOptions: {
    waitUntil: 'networkidle0',
  },
  
  // Hooks pour les SPA React
  hooks: {
    'page:before-goto': async (page) => {
      await page.waitForTimeout(2000);
    },
  },
  
  // Servir les résultats sur un port spécifique
  server: {
    port: 7331,
  },
}
