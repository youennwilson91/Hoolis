# TODO - Optimisation SEO Hoolis

## 🔴 PRIORITÉ CRITIQUE

### 1. Corriger le serving de l'application React
**Impact:** ⭐⭐⭐⭐⭐ (Critique pour l'indexation)
- [ ] **Problème:** Les routes principales ne sont pas servies par Django
- [ ] **Action:** Décommenter et configurer le catch-all dans `backend/mysite/urls.py`
```python
# Ligne 47-50 - Décommenter cette section :
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='react_app'),
]
```
- [ ] **Test:** Vérifier que `/`, `/fw`, `/hoolis`, `/gallery` sont accessibles
- [ ] **Délai:** 1 jour

### 2. Créer l'image Open Graph manquante
**Impact:** ⭐⭐⭐⭐ (Partage social)
- [ ] **Problème:** `og-image.jpg` référencé mais inexistant
- [ ] **Action:** Créer `/frontend/public/og-image.jpg` (1200x630px)
- [ ] **Contenu:** Logo Hoolis + texte "Boutique de Luxe"
- [ ] **Variantes:** Considérer des images spécifiques par page
- [ ] **Délai:** 2 jours

## 🟠 PRIORITÉ HAUTE

### 3. Mettre à jour et compléter le sitemap.xml
**Impact:** ⭐⭐⭐⭐ (Indexation)
- [ ] **Problème:** Sitemap obsolète (dates 2024-03) et incomplet
- [ ] **Actions:**
  - [ ] Mettre à jour les dates de modification
  - [ ] Ajouter toutes les pages importantes
  - [ ] Ajouter les pages produits individuelles
  - [ ] Considérer un sitemap dynamique Django
```xml
<!-- Ajouter ces URLs manquantes -->
<url><loc>https://hoolis.com/about</loc></url>
<url><loc>https://hoolis.com/contact</loc></url>
<!-- + pages produits -->
```
- [ ] **Délai:** 3 jours

### 4. Implémenter les schémas de données structurées manquants
**Impact:** ⭐⭐⭐ (Rich snippets)
- [ ] **Schémas Product pour chaque article:**
```javascript
// Dans les pages produits, ajouter :
<StructuredData data={createProductSchema(product)} />
```
- [ ] **Corriger les informations de contact fictives:**
```javascript
// Dans StructuredData.jsx, remplacer :
"telephone": "+33-1-XX-XX-XX-XX" // Par le vrai numéro
```
- [ ] **Ajouter breadcrumbs structurées**
- [ ] **Délai:** 4 jours

### 5. Optimiser les performances d'images
**Impact:** ⭐⭐⭐ (Core Web Vitals)
- [ ] **Lazy loading des images:**
```jsx
<img loading="lazy" src="..." alt="..." />
```
- [ ] **Conversion en WebP des images lourdes**
- [ ] **Optimisation des images produits dans `/media/store/`**
- [ ] **Délai:** 5 jours

## 🟡 PRIORITÉ MOYENNE

### 6. Améliorer le chargement des polices
**Impact:** ⭐⭐ (Performance)
- [ ] **Problème:** Police custom sans optimisation
- [ ] **Actions:**
  - [ ] Ajouter `font-display: swap` (✅ déjà fait)
  - [ ] Précharger la police normale aussi
```html
<link rel="preload" href="/champagne-limousines.ttf" as="font" type="font/truetype" crossorigin>
```
- [ ] **Délai:** 2 jours

### 7. Ajouter des favicons complets
**Impact:** ⭐⭐ (Branding)
- [ ] **Problème:** Références à des favicons inexistants
- [ ] **Actions:**
  - [ ] Créer `apple-touch-icon.png` (180x180)
  - [ ] Créer `favicon-32x32.png` et `favicon-16x16.png`
  - [ ] Vérifier `site.webmanifest`
- [ ] **Délai:** 1 jour

### 8. Optimiser les meta tags par page
**Impact:** ⭐⭐⭐ (Pertinence)
- [ ] **Améliorer les descriptions:**
  - [ ] Page Gallery: Ajouter plus de contexte
  - [ ] Page FandW: Mentionner les services
  - [ ] Page Shop: Détailler les catégories
- [ ] **Ajouter des mots-clés longue traîne**
- [ ] **Délai:** 3 jours

## 🟢 PRIORITÉ BASSE

### 9. Implémenter un système de monitoring SEO
**Impact:** ⭐⭐ (Maintenance)
- [ ] **Google Search Console:** Vérifier la configuration
- [ ] **Google Analytics:** Implémenter le tracking
- [ ] **Monitoring des erreurs 404**
- [ ] **Alerts pour les problèmes d'indexation**
- [ ] **Délai:** 1 semaine

### 10. Ajouter du contenu textuel
**Impact:** ⭐⭐ (Contenu)
- [ ] **Page About manquante:** Créer du contenu sur l'histoire Hoolis
- [ ] **Descriptions produits:** Enrichir le contenu textuel
- [ ] **Blog/Actualités:** Considérer l'ajout d'une section blog
- [ ] **Délai:** 2 semaines

### 11. Optimisations techniques avancées
**Impact:** ⭐ (Perfectionnement)
- [ ] **Compression Gzip/Brotli** (vérifier la config serveur)
- [ ] **Cache headers optimisés**
- [ ] **Minification CSS/JS** (Vite le fait déjà)
- [ ] **Service Worker pour la mise en cache**
- [ ] **Délai:** 1 semaine

## 🔧 OUTILS RECOMMANDÉS

### Analyse et monitoring
- [ ] **Google Search Console** - Configuration et monitoring
- [ ] **Google PageSpeed Insights** - Test de performance
- [ ] **GTmetrix** - Analyse complète
- [ ] **Screaming Frog** - Audit technique complet

### Tests SEO
- [ ] **Test des rich snippets:** https://search.google.com/test/rich-results
- [ ] **Test mobile-friendly:** https://search.google.com/test/mobile-friendly
- [ ] **Test vitesse:** https://pagespeed.web.dev/

## 📊 OBJECTIFS DE PERFORMANCE

### Métriques cibles
- [ ] **Score PageSpeed:** > 90 (actuellement non testé)
- [ ] **Temps de chargement:** < 3 secondes
- [ ] **Core Web Vitals:** Tous en vert
- [ ] **Couverture sitemap:** 100% des pages importantes

### KPIs SEO
- [ ] **Pages indexées:** Toutes les pages principales
- [ ] **Rich snippets:** Au moins pour les produits
- [ ] **Erreurs Search Console:** 0 erreur critique
- [ ] **Position moyenne:** Amélioration de 20% en 3 mois

## 🗓️ PLANNING SUGGÉRÉ

### Semaine 1
- [x] Audit SEO complet (✅ fait)
- [ ] Corriger le serving React
- [ ] Créer l'image Open Graph

### Semaine 2  
- [ ] Mettre à jour le sitemap
- [ ] Implémenter les schémas produits
- [ ] Optimiser les images critiques

### Semaine 3
- [ ] Améliorer les meta tags
- [ ] Ajouter les favicons
- [ ] Tests et corrections

### Semaine 4
- [ ] Monitoring et analytics
- [ ] Optimisations avancées
- [ ] Documentation finale

---

## 📝 NOTES

- **Score SEO actuel:** 6.5/10
- **Score cible:** 9/10
- **Effort estimé:** 2-3 semaines
- **Impact business:** Fort (amélioration visibilité et conversions)

**Dernière mise à jour:** $(date)
**Prochaine révision:** Dans 1 mois
