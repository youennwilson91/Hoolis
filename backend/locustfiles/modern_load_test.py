from locust import HttpUser, task, between, LoadTestShape
import random
import json
from datetime import datetime, timedelta


class ModernHoolisUser(HttpUser):
    """Utilisateur moderne testant l'API Hoolis mise à jour"""
    wait_time = between(1, 3)
    
    def on_start(self):
        """Initialisation de la session utilisateur"""
        self.auth_headers = {}
        # Tentative d'authentification (optionnelle selon votre config)
        try:
            # Récupérer un token JWT si nécessaire
            auth_response = self.client.post("/auth/jwt/create/", json={
                "username": "testuser",
                "password": "testpass123"
            })
            if auth_response.status_code == 200:
                token = auth_response.json().get("access")
                if token:
                    self.auth_headers = {"Authorization": f"Bearer {token}"}
        except Exception:
            pass  # Continue sans authentification
    
    @task(8)
    def browse_products(self):
        """Navigation et consultation des produits"""
        # Liste des produits
        response = self.client.get("/store/products/", headers=self.auth_headers)
        
        if response.status_code == 200:
            products = response.json().get('results', [])
            if products:
                # Consulter un produit aléatoire
                product = random.choice(products)
                product_id = product.get('id')
                
                if product_id:
                    # Détails du produit
                    self.client.get(f"/store/products/{product_id}/", headers=self.auth_headers)
                    
                    # Images du produit
                    self.client.get(f"/store/products/{product_id}/images/", headers=self.auth_headers)
    
    @task(5)
    def browse_collections(self):
        """Consultation des collections"""
        response = self.client.get("/store/collections/", headers=self.auth_headers)
        
        if response.status_code == 200:
            collections = response.json().get('results', [])
            if collections:
                # Consulter une collection aléatoire
                collection = random.choice(collections)
                collection_id = collection.get('id')
                
                if collection_id:
                    self.client.get(f"/store/collections/{collection_id}/", headers=self.auth_headers)
                    
                    # Produits de cette collection
                    self.client.get(f"/store/products/?collection_id={collection_id}", headers=self.auth_headers)
    
    @task(6)
    def browse_watches(self):
        """Consultation des montres"""
        self.client.get("/store/watches/", headers=self.auth_headers)
    
    @task(3)
    def check_product_slots(self):
        """Vérification des créneaux disponibles pour les produits"""
        # Utiliser une date proche (aujourd'hui + 1 à 7 jours)
        future_date = datetime.now() + timedelta(days=random.randint(1, 7))
        date_str = future_date.strftime("%Y-%m-%d")
        
        self.client.get(f"/store/available-slots-products/?date={date_str}", headers=self.auth_headers)
    
    @task(3)
    def check_watch_slots(self):
        """Vérification des créneaux disponibles pour les montres"""
        # Utiliser une date proche (aujourd'hui + 1 à 7 jours)
        future_date = datetime.now() + timedelta(days=random.randint(1, 7))
        date_str = future_date.strftime("%Y-%m-%d")
        
        self.client.get(f"/store/available-slots-watches/?date={date_str}", headers=self.auth_headers)
    
    @task(2)
    def book_product_appointment(self):
        """Tentative de réservation pour un produit"""
        # D'abord récupérer les créneaux disponibles
        future_date = datetime.now() + timedelta(days=random.randint(1, 7))
        date_str = future_date.strftime("%Y-%m-%d")
        
        slots_response = self.client.get(f"/store/available-slots-products/?date={date_str}", headers=self.auth_headers)
        
        if slots_response.status_code == 200:
            slots = slots_response.json().get('results', [])
            if slots:
                slot = random.choice(slots)
                
                booking_data = {
                    "name": f"TestUser{random.randint(1000, 9999)}",
                    "product": "Test Product",
                    "date": date_str,
                    "start_time": slot.get("start_time"),
                    "end_time": slot.get("end_time")
                }
                
                self.client.post("/store/bookings-products/", 
                               json=booking_data, 
                               headers=self.auth_headers)
    
    @task(2)
    def book_watch_appointment(self):
        """Tentative de réservation pour une montre"""
        # D'abord récupérer les créneaux disponibles
        future_date = datetime.now() + timedelta(days=random.randint(1, 7))
        date_str = future_date.strftime("%Y-%m-%d")
        
        slots_response = self.client.get(f"/store/available-slots-watches/?date={date_str}", headers=self.auth_headers)
        
        if slots_response.status_code == 200:
            slots = slots_response.json().get('results', [])
            if slots:
                slot = random.choice(slots)
                
                booking_data = {
                    "name": f"TestUser{random.randint(1000, 9999)}",
                    "watch": "Test Watch",
                    "date": date_str,
                    "start_time": slot.get("start_time"),
                    "end_time": slot.get("end_time")
                }
                
                self.client.post("/store/bookings-watches/", 
                               json=booking_data, 
                               headers=self.auth_headers)
    
    @task(4)
    def search_products(self):
        """Recherche de produits"""
        search_terms = ["watch", "luxury", "collection", "premium", "limited"]
        term = random.choice(search_terms)
        
        self.client.get(f"/store/products/?search={term}", headers=self.auth_headers)
    
    @task(3)
    def filter_products(self):
        """Filtrage des produits par prix"""
        # Test des filtres de prix
        price_ranges = [
            "?ordering=price",
            "?ordering=-price",
            "?price__gte=100",
            "?price__lte=1000"
        ]
        filter_param = random.choice(price_ranges)
        
        self.client.get(f"/store/products/{filter_param}", headers=self.auth_headers)
    
    @task(1)
    def api_home(self):
        """Page d'accueil de l'API"""
        self.client.get("/")


class ReadOnlyUser(HttpUser):
    """Utilisateur en lecture seule (sans authentification)"""
    wait_time = between(0.5, 2)
    
    @task(10)
    def browse_products_readonly(self):
        """Navigation produits sans authentification"""
        self.client.get("/store/products/")
    
    @task(5)
    def browse_collections_readonly(self):
        """Navigation collections sans authentification"""
        self.client.get("/store/collections/")
    
    @task(3)
    def browse_watches_readonly(self):
        """Navigation montres sans authentification"""
        self.client.get("/store/watches/")


class ProgressiveLoadShape(LoadTestShape):
    """
    Test de charge progressif avec plusieurs phases :
    1. Échauffement graduel
    2. Montée en charge
    3. Plateau de performance
    4. Test de pic
    5. Descente progressive
    """
    
    # Phase 1 : Échauffement (0-2 min)
    # Phase 2 : Montée normale (2-5 min)
    # Phase 3 : Plateau normal (5-10 min)
    # Phase 4 : Test de pic (10-12 min)
    # Phase 5 : Retour normal (12-15 min)
    # Phase 6 : Descente (15-17 min)
    
    def tick(self):
        run_time = self.get_run_time()
        
        if run_time < 120:  # 0-2 min : Échauffement
            user_count = int(run_time / 120 * 20)  # 0 à 20 utilisateurs
            spawn_rate = 2
        elif run_time < 300:  # 2-5 min : Montée normale
            user_count = 20 + int((run_time - 120) / 180 * 30)  # 20 à 50 utilisateurs
            spawn_rate = 3
        elif run_time < 600:  # 5-10 min : Plateau normal
            user_count = 50
            spawn_rate = 5
        elif run_time < 720:  # 10-12 min : Test de pic
            user_count = 50 + int((run_time - 600) / 120 * 50)  # 50 à 100 utilisateurs
            spawn_rate = 8
        elif run_time < 900:  # 12-15 min : Retour normal
            user_count = 100 - int((run_time - 720) / 180 * 50)  # 100 à 50 utilisateurs
            spawn_rate = 5
        elif run_time < 1020:  # 15-17 min : Descente
            user_count = 50 - int((run_time - 900) / 120 * 50)  # 50 à 0 utilisateurs
            spawn_rate = 5
        else:
            return None  # Fin du test
        
        return user_count, spawn_rate


class StressTestShape(LoadTestShape):
    """
    Test de stress avec montée agressive pour tester les limites
    """
    
    def tick(self):
        run_time = self.get_run_time()
        
        if run_time < 60:  # 1 min : Préparation
            return 10, 5
        elif run_time < 180:  # 2-3 min : Montée agressive
            user_count = 10 + int((run_time - 60) / 120 * 140)  # 10 à 150 utilisateurs
            return user_count, 10
        elif run_time < 300:  # 3-5 min : Maintien du stress
            return 150, 10
        elif run_time < 360:  # 5-6 min : Descente rapide
            user_count = 150 - int((run_time - 300) / 60 * 150)  # 150 à 0
            return user_count, 10
        else:
            return None 