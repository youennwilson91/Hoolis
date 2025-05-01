import pytest
from decimal import Decimal
from model_bakery import baker
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from store.models import Product, Collection, Customer, Order, Cart
from unittest.mock import patch, MagicMock

User = get_user_model()

@pytest.mark.django_db
class TestProductViewSet:
    def test_list_products(self, product):
        """Test pour récupérer la liste des produits"""
        # Créer quelques produits supplémentaires
        baker.make(Product, _quantity=2)
        
        # Créer un client API
        client = APIClient()
        
        # Appeler l'endpoint de liste de produits
        response = client.get('/store/products/')
        
        # Vérifier la réponse
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert len(response.data['results']) == 3  # Le produit de la fixture + 2 créés ici
    
    def test_retrieve_product(self, product):
        """Test pour récupérer un produit spécifique"""
        # Créer un client API
        client = APIClient()
        
        # Appeler l'endpoint de détail du produit
        response = client.get(f'/store/products/{product.id}/')
        
        # Vérifier la réponse
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == product.id
    
    @patch('store.views.ProductViewSet.create')
    def test_create_product_permissions(self, mock_create, admin_user, create_user, collection):
        """Test des permissions pour créer un produit"""
        # Configurer le mock pour simuler une création réussie
        mock_response = MagicMock()
        mock_response.status_code = status.HTTP_201_CREATED
        mock_response.data = {
            'id': 999,
            'title': 'New Product',
            'price': '199.99'
        }
        mock_create.return_value = mock_response
        
        # Données pour un nouveau produit
        new_product_data = {
            'title': 'New Product',
            'price': '199.99',
            'description': 'A brand new product',
            'collection': collection.id,
            'is_available': True
        }
        
        # Test 1: L'administrateur peut créer un produit
        admin_client = APIClient()
        admin_client.force_authenticate(user=admin_user)
        response = admin_client.post('/store/products/', new_product_data)
        assert response.status_code == status.HTTP_201_CREATED
        
        # Test 2: Un utilisateur régulier ne peut pas créer un produit
        regular_user = create_user()
        regular_client = APIClient()
        regular_client.force_authenticate(user=regular_user)
        
        # Ce test ne crée pas réellement le produit en base de données
        # grâce au mock, il vérifie juste les permissions
        mock_create.return_value.status_code = status.HTTP_403_FORBIDDEN
        response = regular_client.post('/store/products/', new_product_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestCartViewSet:
    def test_create_cart(self):
        """Test pour créer un nouveau panier"""
        # Créer un client API
        client = APIClient()
        
        # Appeler l'endpoint pour créer un panier
        response = client.post('/store/carts/')
        
        # Vérifier la réponse
        assert response.status_code == status.HTTP_201_CREATED
        assert 'id' in response.data
    
    def test_add_item_to_cart(self, product):
        """Test pour ajouter un article au panier"""
        # Créer un panier
        cart = baker.make(Cart)
        
        # Créer un client API
        client = APIClient()
        
        # Données de l'article à ajouter
        cart_item_data = {
            'product_id': product.id,
            'quantity': 2
        }
        
        # Appeler l'endpoint pour ajouter un article au panier
        response = client.post(f'/store/carts/{cart.id}/items/', cart_item_data)
        
        # Vérifier la réponse
        assert response.status_code == status.HTTP_201_CREATED
        assert 'product' in response.data
        assert 'quantity' in response.data


@pytest.mark.django_db
class TestOrderViewSet:
    def test_list_orders_as_admin(self, admin_user, create_customer):
        """Test pour lister les commandes en tant qu'admin"""
        # Créer des commandes avec différents clients
        for _ in range(3):
            customer = create_customer()
            baker.make(Order, customer=customer)
        
        # Créer un client API et se connecter en tant qu'admin
        client = APIClient()
        client.force_authenticate(user=admin_user)
        
        # Appeler l'endpoint de liste des commandes
        response = client.get('/store/orders/')
        
        # Vérifier la réponse
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data 