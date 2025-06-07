# Tests de Performance Locust pour Hoolis API

Ce dossier contient les tests de performance modernisés pour l'API Hoolis utilisant Locust.

## Fichiers de test

### 1. `modern_load_test.py` - Tests de charge modernes
Tests complets avec plusieurs classes d'utilisateurs et scénarios de montée en charge :

- **ModernHoolisUser** : Utilisateur authentifié testant tous les endpoints
- **ReadOnlyUser** : Utilisateur en lecture seule (sans authentification)
- **ProgressiveLoadShape** : Montée de charge progressive (17 minutes)
- **StressTestShape** : Test de stress agressif (6 minutes)

### 2. `api_endpoints_test.py` - Tests d'endpoints spécialisés
Tests focalisés sur la couverture complète des endpoints :

- **APIEndpointsUser** : Test exhaustif de tous les endpoints
- **LightweightAPIUser** : Tests légers pour charge rapide

### 3. `load_test.py` - Anciens tests (obsolètes)
⚠️ Ces tests sont obsolètes et utilisent des endpoints qui n'existent plus.

## Prérequis

```bash
pip install locust
```

## Utilisation

### Tests de base (recommandé pour débuter)
```bash
# Depuis le dossier backend
locust -f locustfiles/modern_load_test.py --host=http://localhost:8000
```

### Tests avec forme de charge progressive
```bash
locust -f locustfiles/modern_load_test.py --host=http://localhost:8000 ModernHoolisUser ProgressiveLoadShape
```

### Tests de stress
```bash
locust -f locustfiles/modern_load_test.py --host=http://localhost:8000 ModernHoolisUser StressTestShape
```

### Tests d'endpoints complets
```bash
locust -f locustfiles/api_endpoints_test.py --host=http://localhost:8000 APIEndpointsUser
```

### Tests légers pour charge rapide
```bash
locust -f locustfiles/api_endpoints_test.py --host=http://localhost:8000 LightweightAPIUser
```

### Tests mixtes (utilisateurs authentifiés + lecture seule)
```bash
locust -f locustfiles/modern_load_test.py --host=http://localhost:8000 ModernHoolisUser ReadOnlyUser
```

## Scénarios de test

### ModernHoolisUser
- ✅ Navigation des produits avec détails et images
- ✅ Consultation des collections
- ✅ Parcours des montres
- ✅ Vérification des créneaux disponibles
- ✅ Création de réservations (produits et montres)
- ✅ Recherche et filtrage de produits
- ✅ Authentification JWT

### APIEndpointsUser
- ✅ Test de tous les endpoints GET
- ✅ Test des endpoints POST (création de réservations)
- ✅ Test des filtres et pagination
- ✅ Test des endpoints d'authentification
- ✅ Gestion d'erreurs et cas limites

### Formes de charge

#### ProgressiveLoadShape (17 minutes)
1. **Échauffement** (0-2 min) : 0 → 20 utilisateurs
2. **Montée normale** (2-5 min) : 20 → 50 utilisateurs  
3. **Plateau normal** (5-10 min) : 50 utilisateurs
4. **Test de pic** (10-12 min) : 50 → 100 utilisateurs
5. **Retour normal** (12-15 min) : 100 → 50 utilisateurs
6. **Descente** (15-17 min) : 50 → 0 utilisateurs

#### StressTestShape (6 minutes)
1. **Préparation** (0-1 min) : 10 utilisateurs
2. **Montée agressive** (1-3 min) : 10 → 150 utilisateurs
3. **Maintien du stress** (3-5 min) : 150 utilisateurs
4. **Descente rapide** (5-6 min) : 150 → 0 utilisateurs

## Endpoints testés

### Produits
- `GET /store/products/` - Liste des produits
- `GET /store/products/{id}/` - Détail d'un produit
- `GET /store/products/{id}/images/` - Images d'un produit
- `GET /store/products/?search=term` - Recherche
- `GET /store/products/?ordering=price` - Tri
- `GET /store/products/?collection_id=X` - Filtrage par collection

### Collections
- `GET /store/collections/` - Liste des collections
- `GET /store/collections/{id}/` - Détail d'une collection

### Montres
- `GET /store/watches/` - Liste des montres

### Créneaux et Réservations
- `GET /store/available-slots-products/?date=YYYY-MM-DD` - Créneaux produits
- `GET /store/available-slots-watches/?date=YYYY-MM-DD` - Créneaux montres
- `POST /store/bookings-products/` - Réserver un créneau produit
- `POST /store/bookings-watches/` - Réserver un créneau montre

### Authentification
- `POST /auth/jwt/create/` - Création de token JWT
- `POST /auth/jwt/verify/` - Vérification de token

## Configuration et personnalisation

### Variables d'environnement
```bash
# URL de base de l'API
export LOCUST_HOST=http://localhost:8000

# Nombre d'utilisateurs par défaut
export LOCUST_USERS=50

# Taux de spawn par défaut
export LOCUST_SPAWN_RATE=5
```

### Authentification
Les tests tentent une authentification avec :
- Username: `admin` / `testuser`
- Password: `admin123` / `testpass123`

Modifiez ces valeurs dans les fichiers selon votre configuration.

### Métriques importantes à surveiller
- **Response time** : Temps de réponse moyen/médian
- **Requests per second** : Débit de l'API
- **Failure rate** : Taux d'erreur
- **95th percentile** : Temps de réponse pour 95% des requêtes

## Conseils d'utilisation

1. **Commencez petit** : Lancez avec 10-20 utilisateurs pour valider
2. **Montée progressive** : Utilisez `ProgressiveLoadShape` pour des tests réalistes
3. **Surveillez les ressources** : CPU, mémoire, DB du serveur
4. **Tests en isolation** : Testez sur un environnement dédié
5. **Baseline** : Établissez une baseline avant optimisations

## Dépannage

### Erreurs 401/403
- Vérifiez l'authentification dans `on_start()`
- Vérifiez les permissions des endpoints

### Erreurs 404
- Vérifiez que l'API est accessible à l'URL spécifiée
- Vérifiez que les endpoints existent

### Performances dégradées
- Réduisez le nombre d'utilisateurs
- Augmentez le `wait_time`
- Vérifiez les ressources du serveur de test 