# Tests de Charge Locust pour le Projet Hoolis

Ce répertoire contient des fichiers de test Locust pour mesurer les performances de l'application Hoolis en simulant différents scénarios d'utilisation.

## Prérequis

- Python 3.6+
- Locust (`pip install locust`)

## Fichiers de test disponibles

- `basic_test.py`: Test basique de navigation sur les différentes pages frontend (Landing, About, Shop, F&W, Support, Hoolis)
- `api_test.py`: Test des API du store (produits, collections, montres, paniers, etc.)
- `load_test.py`: Test de charge complet simulant des utilisateurs qui naviguent sur le site et interagissent avec les API

## Exécution des tests

### Mode Interface Web

Pour lancer les tests avec l'interface graphique, exécutez la commande suivante depuis la racine du projet:

```bash
locust -f locustfiles/basic_test.py
```

Puis, ouvrez votre navigateur à l'adresse http://localhost:8089/ pour accéder à l'interface Locust.

### Configuration du test

Dans l'interface web Locust, vous devrez spécifier:

1. **Host**: L'URL de base de votre application
   - Pour le frontend: `http://localhost:3000` (ou votre URL de développement frontend)
   - Pour les API backend: `http://localhost:8000` (ou votre URL de développement backend)

2. **Number of users**: Le nombre d'utilisateurs à simuler (commencez par un petit nombre)

3. **Spawn rate**: Le nombre d'utilisateurs à démarrer par seconde

### Exécution en ligne de commande

Pour exécuter les tests directement depuis la ligne de commande:

#### Test du frontend:
```bash
locust -f locustfiles/basic_test.py --headless -u 20 -r 5 -t 3m --host=http://localhost:3000
```

#### Test des API backend:
```bash
locust -f locustfiles/api_test.py --headless -u 20 -r 5 -t 3m --host=http://localhost:8000
```

#### Test complet (avec un proxy pour rediriger les requêtes):
```bash
locust -f locustfiles/load_test.py --headless -u 30 -r 5 -t 5m --host=http://localhost
```

Paramètres:
- `-u 20`: Nombre d'utilisateurs à simuler
- `-r 5`: Taux de démarrage de 5 utilisateurs par seconde
- `-t 3m`: Durée du test (3 minutes)
- `--host`: URL de base de l'application

## Configuration pour tests combinés

Pour les tests qui nécessitent d'accéder à la fois au frontend et au backend, vous pouvez:

1. **Utiliser un proxy inverse**: Configurer un proxy comme Nginx pour rediriger les requêtes vers les bons services
2. **Adapter les URL dans les tests**: Modifier les chemins dans les tests pour pointer vers les bonnes URL

## Bonnes pratiques

1. Commencez par de petits tests avec peu d'utilisateurs pour vérifier la validité des tests
2. Augmentez progressivement la charge pour trouver les limites de l'application
3. Surveillez les métriques système pendant les tests (CPU, mémoire, réseau)
4. Analysez les rapports générés par Locust pour identifier les points faibles

## Métriques importantes à surveiller

- **Temps de réponse médian**: Devrait rester stable même avec l'augmentation de la charge
- **Percentile 95%**: Les temps de réponse pour les 5% les plus lents ne devraient pas augmenter trop rapidement
- **Taux d'erreur**: Idéalement proche de 0%, même sous charge 