import pytest
import uuid
from django.contrib.auth import get_user_model
from django.utils import timezone
from store.models import Customer, Product, Collection, Promotion, Order
from decimal import Decimal

User = get_user_model()

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

@pytest.fixture
def promotion():
    """Fixture pour créer une promotion"""
    return Promotion.objects.create(
        name="Test Promotion",
        description="Test promotion description",
        discount=Decimal("10.00")
    ) 