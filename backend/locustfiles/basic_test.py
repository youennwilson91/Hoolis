from locust import HttpUser, task, between

class BasicUser(HttpUser):
    wait_time = between(1, 3)  # Attendre entre 1 et 3 secondes entre les tâches
    
    @task
    def homepage(self):
        # Tester la page d'accueil
        self.client.get("/")
        
    @task
    def about_page(self):
        # Tester la page About
        self.client.get("/about")
        
    @task
    def shop_page(self):
        # Tester la page Shop
        self.client.get("/shop")
        
    @task
    def fw_page(self):
        # Tester la page F&W
        self.client.get("/fw")
        
    @task
    def support_page(self):
        # Tester la page Support
        self.client.get("/support")
        
    @task
    def hoolis_page(self):
        # Tester la page Hoolis
        self.client.get("/hoolis") 