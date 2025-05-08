from locust import HttpUser, task, between

class ProductsUser(HttpUser):
    """Test uniquement l'endpoint des produits"""
    wait_time = between(1, 2)
    
    @task
    def get_products(self):
        self.client.get("/store/products/")

class CollectionsUser(HttpUser):
    """Test uniquement l'endpoint des collections"""
    wait_time = between(1, 2)
    
    @task
    def get_collections(self):
        self.client.get("/store/collections/")

class WatchesUser(HttpUser):
    """Test uniquement l'endpoint des montres"""
    wait_time = between(1, 2)
    
    @task
    def get_watches(self):
        self.client.get("/store/watches/")

class SlotsUser(HttpUser):
    """Test uniquement l'endpoint des créneaux disponibles"""
    wait_time = between(1, 2)
    
    @task
    def get_slots(self):
        self.client.get("/store/available_slots/") 