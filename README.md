# Hoolis

Ce projet consiste en une application React (frontend) et Django (backend).

## Exécution avec Docker

### Version de production

Pour construire et exécuter la version de production, une seule commande suffit :

```bash
# Construire et démarrer le conteneur
docker-compose up --build

# Accéder à l'application complète (frontend + backend) sur http://localhost:8000
```

L'application React est automatiquement servie par Django - pas besoin de commandes supplémentaires !

### Développement

Pour le développement avec rechargement à chaud du frontend :

```bash
# Démarrer le serveur backend (qui servira aussi le frontend compilé)
docker-compose up

# Dans un terminal séparé, démarrer le serveur de développement frontend
docker-compose --profile dev up frontend-dev

# Accéder au frontend de développement sur http://localhost:5173
# Accéder au backend sur http://localhost:8000
```

## Configuration manuelle

### Frontend

```bash
cd frontend
npm install
npm run dev     # Serveur de développement
npm run build   # Construction pour production
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Comment ça marche

Le Dockerfile est configuré pour :
1. Construire l'application React
2. Copier les fichiers compilés dans le répertoire statique de Django
3. Configurer Django pour servir ces fichiers statiques
4. Exécuter le serveur Django qui sert à la fois l'API backend et l'interface utilisateur frontend 