from locust import HttpUser, task, between
import random

class StoreApiLightUser(HttpUser):
    # Augmenter le temps d'attente entre les requêtes
    wait_time = between(5, 10)  # 5-10 secondes
    
    @task(3)
    def get_products(self):
        # Récupérer la liste des produits
        self.client.get("/store/products/")
    
    @task(2)
    def get_collections(self):
        # Récupérer les collections
        self.client.get("/store/collections/")
    
    @task
    def get_watches(self):
        # Récupérer les montres
        self.client.get("/store/watches/") 