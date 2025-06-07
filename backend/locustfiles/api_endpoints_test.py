from locust import HttpUser, task, between
import random
import json
from datetime import datetime, timedelta


class APIEndpointsUser(HttpUser):
    """Test complet de tous les endpoints de l'API Hoolis"""
    wait_time = between(1, 2)
    
    def on_start(self):
        """Initialisation et tentative d'authentification"""
        self.auth_headers = {}
        self.products_cache = []
        self.collections_cache = []
        
        # Tentative d'authentification pour les tests complets
        try:
            auth_response = self.client.post("/auth/jwt/create/", json={
                "username": "admin",
                "password": "admin123"
            })
            if auth_response.status_code == 200:
                token = auth_response.json().get("access")
                if token:
                    self.auth_headers = {"Authorization": f"Bearer {token}"}
        except Exception:
            pass
        
        # Charger les données de base
        self._load_base_data()
    
    def _load_base_data(self):
        """Charger les produits et collections pour les tests"""
        try:
            products_response = self.client.get("/store/products/", headers=self.auth_headers)
            if products_response.status_code == 200:
                self.products_cache = products_response.json().get('results', [])
            
            collections_response = self.client.get("/store/collections/", headers=self.auth_headers)
            if collections_response.status_code == 200:
                self.collections_cache = collections_response.json().get('results', [])
        except Exception:
            pass
    
    @task(10)
    def test_products_endpoints(self):
        """Test des endpoints produits - GET"""
        # Liste des produits
        self.client.get("/store/products/", headers=self.auth_headers)
        
        # Test avec pagination
        self.client.get("/store/products/?page=1", headers=self.auth_headers)
        
        # Test avec recherche
        search_terms = ["watch", "premium", "collection"]
        term = random.choice(search_terms)
        self.client.get(f"/store/products/?search={term}", headers=self.auth_headers)
        
        # Test avec tri
        ordering_options = ["price", "-price", "title", "-title"]
        ordering = random.choice(ordering_options)
        self.client.get(f"/store/products/?ordering={ordering}", headers=self.auth_headers)
        
        # Test détail d'un produit
        if self.products_cache:
            product = random.choice(self.products_cache)
            product_id = product.get('id')
            if product_id:
                self.client.get(f"/store/products/{product_id}/", headers=self.auth_headers)
                self.client.get(f"/store/products/{product_id}/images/", headers=self.auth_headers)
    
    @task(8)
    def test_collections_endpoints(self):
        """Test des endpoints collections"""
        # Liste des collections
        self.client.get("/store/collections/", headers=self.auth_headers)
        
        # Test avec recherche
        self.client.get("/store/collections/?search=luxury", headers=self.auth_headers)
        
        # Test détail d'une collection
        if self.collections_cache:
            collection = random.choice(self.collections_cache)
            collection_id = collection.get('id')
            if collection_id:
                self.client.get(f"/store/collections/{collection_id}/", headers=self.auth_headers)
                # Produits de cette collection
                self.client.get(f"/store/products/?collection_id={collection_id}", headers=self.auth_headers)
    
    @task(6)
    def test_watches_endpoints(self):
        """Test des endpoints montres"""
        self.client.get("/store/watches/", headers=self.auth_headers)
    
    @task(5)
    def test_slots_endpoints(self):
        """Test des endpoints de créneaux"""
        # Générer des dates de test
        future_dates = []
        for i in range(1, 8):  # 7 jours à l'avance
            date = datetime.now() + timedelta(days=i)
            future_dates.append(date.strftime("%Y-%m-%d"))
        
        test_date = random.choice(future_dates)
        
        # Créneaux pour produits
        self.client.get(f"/store/available-slots-products/?date={test_date}", 
                       headers=self.auth_headers)
        
        # Créneaux pour montres
        self.client.get(f"/store/available-slots-watches/?date={test_date}", 
                       headers=self.auth_headers)
    
    @task(3)
    def test_bookings_endpoints_read(self):
        """Test de lecture des réservations"""
        # Note: Les endpoints de réservation sont principalement POST/DELETE
        # Test des endpoints de créneaux comme proxy
        future_date = datetime.now() + timedelta(days=random.randint(1, 7))
        date_str = future_date.strftime("%Y-%m-%d")
        
        self.client.get(f"/store/slots-products/?date={date_str}", headers=self.auth_headers)
        self.client.get(f"/store/slots-watches/?date={date_str}", headers=self.auth_headers)
    
    @task(2)
    def test_create_booking_product(self):
        """Test de création de réservation produit"""
        future_date = datetime.now() + timedelta(days=random.randint(1, 7))
        date_str = future_date.strftime("%Y-%m-%d")
        
        # D'abord récupérer les créneaux
        slots_response = self.client.get(f"/store/available-slots-products/?date={date_str}", 
                                       headers=self.auth_headers)
        
        if slots_response.status_code == 200:
            try:
                slots_data = slots_response.json()
                slots = slots_data.get('results', []) if isinstance(slots_data, dict) else slots_data
                
                if slots:
                    slot = random.choice(slots)
                    booking_data = {
                        "name": f"LoadTest{random.randint(1000, 9999)}",
                        "product": "Load Test Product",
                        "date": date_str,
                        "start_time": slot.get("start_time", "10:00:00"),
                        "end_time": slot.get("end_time", "11:00:00")
                    }
                    
                    self.client.post("/store/bookings-products/", 
                                   json=booking_data, 
                                   headers=self.auth_headers)
            except Exception:
                pass
    
    @task(2)
    def test_create_booking_watch(self):
        """Test de création de réservation montre"""
        future_date = datetime.now() + timedelta(days=random.randint(1, 7))
        date_str = future_date.strftime("%Y-%m-%d")
        
        # D'abord récupérer les créneaux
        slots_response = self.client.get(f"/store/available-slots-watches/?date={date_str}", 
                                       headers=self.auth_headers)
        
        if slots_response.status_code == 200:
            try:
                slots_data = slots_response.json()
                slots = slots_data.get('results', []) if isinstance(slots_data, dict) else slots_data
                
                if slots:
                    slot = random.choice(slots)
                    booking_data = {
                        "name": f"LoadTest{random.randint(1000, 9999)}",
                        "watch": "Load Test Watch",
                        "date": date_str,
                        "start_time": slot.get("start_time", "14:00:00"),
                        "end_time": slot.get("end_time", "15:00:00")
                    }
                    
                    self.client.post("/store/bookings-watches/", 
                                   json=booking_data, 
                                   headers=self.auth_headers)
            except Exception:
                pass
    
    @task(4)
    def test_filtering_and_pagination(self):
        """Test des filtres avancés et pagination"""
        # Test des filtres de prix
        price_filters = [
            "?price__gte=50",
            "?price__lte=500",
            "?price__gte=100&price__lte=1000"
        ]
        filter_param = random.choice(price_filters)
        self.client.get(f"/store/products/{filter_param}", headers=self.auth_headers)
        
        # Test de pagination
        page_params = ["?page=1", "?page=2", "?page_size=5", "?page_size=20"]
        param = random.choice(page_params)
        self.client.get(f"/store/products/{param}", headers=self.auth_headers)
    
    @task(1)
    def test_api_root(self):
        """Test de la page d'accueil API"""
        self.client.get("/")
    
    @task(1)
    def test_auth_endpoints(self):
        """Test des endpoints d'authentification"""
        # Test de création de token (peut échouer, c'est normal)
        self.client.post("/auth/jwt/create/", json={
            "username": "testuser",
            "password": "wrongpass"
        })
        
        # Test de vérification de token (peut échouer, c'est normal)
        if self.auth_headers:
            self.client.post("/auth/jwt/verify/", 
                           json={"token": "dummy_token"})


class LightweightAPIUser(HttpUser):
    """Utilisateur léger pour tests de charge simples"""
    wait_time = between(0.5, 1.5)
    
    @task(15)
    def quick_products_browse(self):
        """Navigation rapide des produits"""
        self.client.get("/store/products/")
    
    @task(10)
    def quick_collections_browse(self):
        """Navigation rapide des collections"""
        self.client.get("/store/collections/")
    
    @task(8)
    def quick_watches_browse(self):
        """Navigation rapide des montres"""
        self.client.get("/store/watches/")
    
    @task(5)
    def quick_search(self):
        """Recherche rapide"""
        terms = ["watch", "luxury", "premium"]
        term = random.choice(terms)
        self.client.get(f"/store/products/?search={term}")
    
    @task(2)
    def quick_api_home(self):
        """Page d'accueil"""
        self.client.get("/") 