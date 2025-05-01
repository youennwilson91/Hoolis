import pytest
from model_bakery import baker
from rest_framework.test import APIClient
from rest_framework import status
from store.models import Product, Order
from unittest.mock import patch, MagicMock

@pytest.mark.django_db
class TestProductPermissions:
    def test_any_user_can_view_products(self, regular_user, product):
        """Vérifier que n'importe quel utilisateur peut voir les produits"""
        # Créer un client API
        client = APIClient()
        
        # Vérifier que l'utilisateur anonyme peut voir le produit
        response = client.get(f'/store/products/{product.id}/')
        assert response.status_code == status.HTTP_200_OK
        
        # Vérifier qu'un utilisateur connecté peut voir le produit
        client.force_authenticate(user=regular_user)
        response = client.get(f'/store/products/{product.id}/')
        assert response.status_code == status.HTTP_200_OK
    
    def test_admin_can_update_product(self, admin_user, product):
        """Vérifier qu'un admin peut mettre à jour un produit"""
        # Créer un client API et se connecter en tant qu'admin
        client = APIClient()
        client.force_authenticate(user=admin_user)
        
        # Mettre à jour le produit
        update_data = {'title': 'Updated Title'}
        response = client.patch(f'/store/products/{product.id}/', update_data)
        
        # Vérifier la réponse
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Title'
    
    def test_regular_user_cannot_update_product(self, regular_user, product):
        """Vérifier qu'un utilisateur normal ne peut pas mettre à jour un produit"""
        # Créer un client API et se connecter en tant qu'utilisateur normal
        client = APIClient()
        client.force_authenticate(user=regular_user)
        
        # Tenter de mettre à jour le produit
        update_data = {'title': 'Updated Title'}
        response = client.patch(f'/store/products/{product.id}/', update_data)
        
        # Vérifier que la mise à jour est refusée
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestOrderPermissions:
    def test_admin_permissions(self, admin_user):
        """Test que l'admin a des droits d'accès spéciaux"""
        # Créer un client API et se connecter en tant qu'admin
        client = APIClient()
        client.force_authenticate(user=admin_user)
        
        # Vérifier l'accès à la liste des commandes (qui est limité aux admins)
        response = client.get('/store/orders/')
        
        # Admin devrait avoir accès à cette liste
        assert response.status_code == status.HTTP_200_OK 