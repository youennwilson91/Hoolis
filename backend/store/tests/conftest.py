import pytest
import uuid
import time
import hmac
import hashlib
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from store.models import Customer, Product, Collection, Order
from decimal import Decimal

User = get_user_model()


def sign_stripe_payload(payload, secret=None, timestamp=None):
    """
    Génère un header Stripe-Signature valide pour un payload donné,
    en suivant le même format que celui vérifié par stripe.Webhook.construct_event
    (t=<timestamp>,v1=hmac_sha256(secret, f"{timestamp}.{payload}")).
    """
    secret = secret if secret is not None else settings.STRIPE_WEBHOOK_SECRET
    timestamp = timestamp if timestamp is not None else int(time.time())
    signed_payload = f"{timestamp}.{payload}"
    signature = hmac.new(
        secret.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return f"t={timestamp},v1={signature}"


@pytest.fixture
def stripe_checkout_session_payload():
    """Fixture factory : construit un event Stripe checkout.session.* minimal (dict JSON-sérialisable)"""
    def _make(
        event_type='checkout.session.completed',
        session_id=None,
        payment_status='paid',
        customer_email='customer@example.com',
        amount_total=9999,
        metadata=None,
    ):
        session_id = session_id or f"cs_test_{uuid.uuid4().hex[:16]}"
        return {
            'id': f"evt_{uuid.uuid4().hex[:16]}",
            'type': event_type,
            'data': {
                'object': {
                    'id': session_id,
                    'object': 'checkout.session',
                    'payment_status': payment_status,
                    'customer_email': customer_email,
                    'amount_total': amount_total,
                    'metadata': metadata or {},
                }
            }
        }
    return _make

@pytest.fixture
def admin_user():
    """Créer un utilisateur administrateur pour les tests"""
    username = f"admin_{uuid.uuid4().hex[:8]}"
    return User.objects.create_superuser(
        username=username,
        email=f"{username}@example.com",
        password='adminpassword'
    )

@pytest.fixture
def regular_user():
    """Créer un utilisateur régulier pour les tests"""
    username = f"user_{uuid.uuid4().hex[:8]}"
    return User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password='userpassword'
    )

@pytest.fixture
def create_user():
    """Fixture pour créer des utilisateurs uniques avec des noms générés aléatoirement"""
    def _create_user(is_staff=False):
        username = f"{'admin' if is_staff else 'user'}_{uuid.uuid4().hex[:8]}"
        
        if is_staff:
            return User.objects.create_superuser(
                username=username,
                email=f"{username}@example.com",
                password='adminpassword'
            )
        else:
            return User.objects.create_user(
                username=username,
                email=f"{username}@example.com",
                password='userpassword'
            )
    
    return _create_user

@pytest.fixture
def create_customer(create_user):
    """Fixture pour créer des clients uniques"""
    def _create_customer(user=None):
        if user is None:
            user = create_user()
        
        return Customer.objects.create(
            user=user,
            name=f"Customer {user.username}",
            email=f"{user.username}@example.com",
            phone="123-456-7890",
            address="123 Test St",
            created_at=timezone.now()
        )
    
    return _create_customer

@pytest.fixture
def collection():
    """Fixture pour créer une collection"""
    return Collection.objects.create(name="Test Collection")

@pytest.fixture
def product(collection):
    """Fixture pour créer un produit"""
    return Product.objects.create(
        title="Test Product",
        price=Decimal("99.99"),
        description="Test description",
        collection=collection,
        is_available=True
    )
