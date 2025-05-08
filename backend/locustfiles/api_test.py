from locust import HttpUser, task, between
import random

class StoreApiUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Exécuté lors du démarrage d'un utilisateur"""
        # On pourrait implémenter une authentification ici si nécessaire
        pass
    
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
        
    @task
    def get_watch_images(self):
        # Récupérer les images des montres
        self.client.get("/store/watches/images/")
    
    @task(2)
    def get_available_slots(self):
        # Récupérer les créneaux disponibles
        self.client.get("/store/available_slots/")
    
    @task
    def create_cart(self):
        # Créer un panier
        response = self.client.post("/store/carts/", json={})
        if response.status_code == 201:
            cart_id = response.json().get("id")
            if cart_id:
                # Ajouter un produit au panier
                product_id = random.randint(1, 5)  # Simuler un ID de produit
                self.client.post(
                    f"/store/carts/{cart_id}/items/",
                    json={"product_id": product_id, "quantity": 1}
                )
                
                # Récupérer les articles du panier
                self.client.get(f"/store/carts/{cart_id}/items/") 