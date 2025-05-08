from locust import HttpUser, task, between, LoadTestShape
import random
import json

class CompleteUser(HttpUser):
    wait_time = between(0.5, 1)
    
    def on_start(self):
        """Initialisation de la session utilisateur"""
        # Créer un panier qui sera utilisé pendant toute la session
        self.cart_id = None
        try:
            response = self.client.post("/store/carts/", json={})
            if response.status_code == 201:
                self.cart_id = response.json().get("id")
        except Exception:
            pass
    
    @task(5)
    def browse_pages(self):
        """Navigation sur les différentes pages du site"""
        pages = ["/", "/about", "/shop", "/fw", "/support", "/hoolis"]
        # Choisir une page au hasard
        page = random.choice(pages)
        self.client.get(page)
        
    @task(3)
    def browse_products(self):
        """Consulter des produits"""
        # Récupérer la liste des produits
        self.client.get("/store/products/")
        
        # Simuler la consultation d'un produit spécifique
        product_id = random.randint(1, 10)  # Simuler un ID de produit
        self.client.get(f"/store/products/{product_id}/")
        
        # Récupérer les images du produit
        self.client.get(f"/store/products/{product_id}/images/")
        
    @task(2)
    def browse_watches(self):
        """Consulter les montres"""
        self.client.get("/store/watches/")
        self.client.get("/store/watches/images/")
        
    @task(1)
    def book_appointment(self):
        """Réserver un créneau de rendez-vous"""
        # Récupérer les créneaux disponibles
        response = self.client.get("/store/available_slots/")
        
        # Simuler une réservation (si des créneaux sont disponibles)
        if response.status_code == 200:
            available_slots = response.json()
            if available_slots and len(available_slots) > 0:
                # Choisir un créneau au hasard
                slot = random.choice(available_slots)
                slot_id = slot.get("id")
                
                if slot_id:
                    # Créer une réservation
                    booking_data = {
                        "slot": slot_id,
                        "name": "Test User",
                        "email": "test@example.com",
                        "phone": "0123456789"
                    }
                    self.client.post("/store/bookings/", json=booking_data)
    
    @task(2)
    def manage_cart(self):
        """Gérer le panier d'achat"""
        if not self.cart_id:
            return
            
        # Ajouter un produit au panier
        product_id = random.randint(1, 5)
        quantity = random.randint(1, 3)
        
        self.client.post(
            f"/store/carts/{self.cart_id}/items/",
            json={"product_id": product_id, "quantity": quantity}
        )
        
        # Consulter le panier
        self.client.get(f"/store/carts/{self.cart_id}/")
        
        # Récupérer les articles du panier
        self.client.get(f"/store/carts/{self.cart_id}/items/")


class StagesShape(LoadTestShape):
    """
    Définition d'une forme de test qui augmente progressivement 
    le nombre d'utilisateurs, maintient un plateau, puis diminue
    """
    stages = [
        {"duration": 60, "users": 10, "spawn_rate": 5},   # Échauffement
        {"duration": 180, "users": 30, "spawn_rate": 5},  # Augmentation à 30 utilisateurs
        {"duration": 300, "users": 50, "spawn_rate": 5},  # Augmentation à 50 utilisateurs
        {"duration": 420, "users": 50, "spawn_rate": 5},  # Maintien à 50 utilisateurs
        {"duration": 540, "users": 30, "spawn_rate": 5},  # Réduction à 30 utilisateurs
        {"duration": 600, "users": 10, "spawn_rate": 5},  # Réduction à 10 utilisateurs
        {"duration": 660, "users": 0, "spawn_rate": 5},   # Fin du test
    ]
    
    def tick(self):
        run_time = self.get_run_time()
        
        for stage in self.stages:
            if run_time < stage["duration"]:
                return stage["users"], stage["spawn_rate"]
        
        return None 