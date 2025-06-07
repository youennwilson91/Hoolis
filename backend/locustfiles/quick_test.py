from locust import HttpUser, task, between
import random


class QuickValidationUser(HttpUser):
    """Test rapide de validation de l'API avant les tests de charge"""
    wait_time = between(1, 2)
    
    @task(20)
    def test_products_basic(self):
        """Test basique des produits"""
        response = self.client.get("/store/products/")
        if response.status_code != 200:
            print(f"❌ Produits - Status: {response.status_code}")
        else:
            print("✅ Produits - OK")
    
    @task(15)
    def test_collections_basic(self):
        """Test basique des collections"""
        response = self.client.get("/store/collections/")
        if response.status_code != 200:
            print(f"❌ Collections - Status: {response.status_code}")
        else:
            print("✅ Collections - OK")
    
    @task(10)
    def test_watches_basic(self):
        """Test basique des montres"""
        response = self.client.get("/store/watches/")
        if response.status_code != 200:
            print(f"❌ Montres - Status: {response.status_code}")
        else:
            print("✅ Montres - OK")
    
    @task(8)
    def test_slots_basic(self):
        """Test basique des créneaux"""
        from datetime import datetime, timedelta
        
        # Test avec date future
        future_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Créneaux produits
        response = self.client.get(f"/store/available-slots-products/?date={future_date}")
        if response.status_code not in [200, 400]:  # 400 peut être normal si pas de créneaux
            print(f"❌ Créneaux produits - Status: {response.status_code}")
        else:
            print("✅ Créneaux produits - OK")
        
        # Créneaux montres
        response = self.client.get(f"/store/available-slots-watches/?date={future_date}")
        if response.status_code not in [200, 400]:  # 400 peut être normal si pas de créneaux
            print(f"❌ Créneaux montres - Status: {response.status_code}")
        else:
            print("✅ Créneaux montres - OK")
    
    @task(5)
    def test_search_basic(self):
        """Test basique de recherche"""
        response = self.client.get("/store/products/?search=test")
        if response.status_code != 200:
            print(f"❌ Recherche - Status: {response.status_code}")
        else:
            print("✅ Recherche - OK")
    
    @task(3)
    def test_api_home(self):
        """Test de la page d'accueil API"""
        response = self.client.get("/")
        if response.status_code != 200:
            print(f"❌ API Home - Status: {response.status_code}")
        else:
            print("✅ API Home - OK")
    
    @task(2)
    def test_auth_endpoint_exists(self):
        """Test que l'endpoint d'auth existe (peut échouer sur les credentials)"""
        response = self.client.post("/auth/jwt/create/", json={
            "username": "test",
            "password": "test"
        })
        # On accepte 400 (bad credentials) comme OK - l'endpoint existe
        if response.status_code not in [200, 400, 401]:
            print(f"❌ Auth endpoint - Status: {response.status_code}")
        else:
            print("✅ Auth endpoint - OK")


class HealthCheckUser(HttpUser):
    """Utilisateur dédié aux vérifications de santé de l'API"""
    wait_time = between(0.5, 1)
    
    @task
    def health_check(self):
        """Vérification de santé simple"""
        endpoints_to_check = [
            "/",
            "/store/products/",
            "/store/collections/",
            "/store/watches/"
        ]
        
        for endpoint in endpoints_to_check:
            response = self.client.get(endpoint)
            if response.status_code == 200:
                print(f"✅ {endpoint} - Healthy")
            else:
                print(f"❌ {endpoint} - Status: {response.status_code}") 