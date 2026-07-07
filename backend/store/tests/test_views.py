import json
import pytest
from decimal import Decimal
from model_bakery import baker
from rest_framework.test import APIClient
from rest_framework import status
from django.test import Client, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from store.models import Product, Collection, Customer, Order, OrderItem
from unittest.mock import patch, MagicMock

from .conftest import sign_stripe_payload

User = get_user_model()

WEBHOOK_URL = '/store/stripe-webhook/'

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


@pytest.mark.django_db
class TestStripeWebhook:
    def _post_event(self, client, event, secret=None):
        payload = json.dumps(event)
        signature = sign_stripe_payload(payload, secret=secret)
        return client.post(
            WEBHOOK_URL,
            data=payload,
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE=signature,
        )

    def test_non_post_method_returns_405(self):
        client = Client()
        response = client.get(WEBHOOK_URL)
        assert response.status_code == 405

    @override_settings(STRIPE_WEBHOOK_SECRET=None)
    def test_missing_webhook_secret_returns_500(self, stripe_checkout_session_payload):
        client = Client()
        event = stripe_checkout_session_payload()
        response = self._post_event(client, event, secret='whatever_secret')
        assert response.status_code == 500

    def test_invalid_payload_returns_400(self):
        client = Client()
        payload = 'not-valid-json'
        signature = sign_stripe_payload(payload)
        response = client.post(
            WEBHOOK_URL,
            data=payload,
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE=signature,
        )
        assert response.status_code == 400

    def test_invalid_signature_returns_400(self, stripe_checkout_session_payload):
        client = Client()
        event = stripe_checkout_session_payload()
        response = self._post_event(client, event, secret='wrong_secret')
        assert response.status_code == 400

    def test_checkout_session_completed_paid_creates_order(
        self, stripe_checkout_session_payload, create_customer, product
    ):
        customer = create_customer()
        event = stripe_checkout_session_payload(
            customer_email=customer.user.email,
            amount_total=int(product.price * 100),
        )
        session_id = event['data']['object']['id']

        line_item = MagicMock()
        line_item.quantity = 2
        line_item.price.product.metadata = {'product_id': str(product.id)}
        mock_line_items = MagicMock()
        mock_line_items.data = [line_item]

        client = Client()
        # send_order_confirmation_email est mocké pour éviter qu'un vrai thread
        # appelle l'API Resend en arrière-plan pendant le test
        with patch('store.views.stripe.checkout.Session.list_line_items', return_value=mock_line_items), \
             patch('store.views.send_order_confirmation_email'):
            response = self._post_event(client, event)

        assert response.status_code == 200
        assert response.content == b'success'

        order = Order.objects.get(stripe_session_id=session_id)
        assert order.customer == customer
        assert order.payment_status == Order.PAYMENT_COMPLETED
        assert OrderItem.objects.filter(order=order, product=product, quantity=2).exists()

    def test_checkout_session_completed_unpaid_is_ignored(self, stripe_checkout_session_payload):
        client = Client()
        event = stripe_checkout_session_payload(payment_status='unpaid')
        response = self._post_event(client, event)

        assert response.status_code == 200
        assert response.content == b'ignored'
        session_id = event['data']['object']['id']
        assert not Order.objects.filter(stripe_session_id=session_id).exists()

    def test_checkout_session_expired_is_logged(self, stripe_checkout_session_payload):
        client = Client()
        event = stripe_checkout_session_payload(event_type='checkout.session.expired')
        response = self._post_event(client, event)

        assert response.status_code == 200
        assert response.content == b'logged'

    def test_unhandled_event_type_is_ignored(self, stripe_checkout_session_payload):
        client = Client()
        event = stripe_checkout_session_payload(event_type='payment_intent.succeeded')
        response = self._post_event(client, event)

        assert response.status_code == 200
        assert response.content == b'ignored'

    def test_duplicate_session_id_does_not_create_second_order(
        self, stripe_checkout_session_payload, create_customer, product
    ):
        customer = create_customer()
        session_id = 'cs_test_duplicate_session'
        event = stripe_checkout_session_payload(
            session_id=session_id,
            customer_email=customer.user.email,
            amount_total=int(product.price * 100),
        )

        line_item = MagicMock()
        line_item.quantity = 1
        line_item.price.product.metadata = {'product_id': str(product.id)}
        mock_line_items = MagicMock()
        mock_line_items.data = [line_item]

        client = Client()
        with patch('store.views.stripe.checkout.Session.list_line_items', return_value=mock_line_items), \
             patch('store.views.send_order_confirmation_email'):
            first_response = self._post_event(client, event)
            second_response = self._post_event(client, event)

        assert first_response.status_code == 200
        assert second_response.status_code == 200
        assert Order.objects.filter(stripe_session_id=session_id).count() == 1

    def test_business_error_returns_500_and_creates_no_order(self, stripe_checkout_session_payload):
        client = Client()
        # customer_email ne correspond à aucun User existant -> "Utilisateur non trouvé"
        event = stripe_checkout_session_payload(customer_email='ghost@example.com')
        session_id = event['data']['object']['id']

        response = self._post_event(client, event)

        assert response.status_code == 500
        assert not Order.objects.filter(stripe_session_id=session_id).exists()