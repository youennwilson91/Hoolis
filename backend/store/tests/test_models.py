import pytest
from decimal import Decimal
from model_bakery import baker
from django.utils import timezone
from store.models import Product, Collection, Promotion, Order, OrderItem, Cart, CartItem

@pytest.mark.django_db
class TestProductModel:
    def test_create_product(self, collection):
        """Test de création d'un produit de base"""
        product = Product.objects.create(
            title="Test Product",
            price=Decimal("99.99"),
            description="Test description",
            collection=collection,
            is_available=True
        )
        
        assert product.id is not None
        assert product.title == "Test Product"
        assert product.price == Decimal("99.99")
        assert product.collection == collection
        assert product.is_available is True
        assert str(product) == "Test Product"
    
    def test_product_with_promotion(self, collection, promotion):
        """Test d'un produit avec promotion"""
        product = Product.objects.create(
            title="Discounted Product",
            price=Decimal("150.00"),
            description="Product with promotion",
            collection=collection,
            promotion=promotion
        )
        
        assert product.promotion.discount == Decimal("10.00")

@pytest.mark.django_db
class TestOrderModel:
    # Test séparé des classes et valeurs des choix de Order
    def test_order_payment_status_choices(self):
        """Test des choix de statut de paiement de Order"""
        assert Order.PAYMENT_PENDING == 'P'
        assert Order.PAYMENT_COMPLETED == 'C'
        assert Order.PAYMENT_FAILED == 'F'
        assert len(Order.PAYMENT_CHOICES) == 3
    
    def test_order_shipping_status_choices(self):
        """Test des choix de statut d'expédition de Order"""
        assert Order.SHIPPING_PENDING == 'P'
        assert Order.SHIPPING_SHIPPED == 'S'
        assert Order.SHIPPING_DELIVERED == 'D'
        assert len(Order.SHIPPING_CHOICES) == 3

@pytest.mark.django_db
class TestCartModel:
    def test_cart_creation(self):
        """Test de création d'un panier"""
        cart = Cart.objects.create()
        
        assert cart.id is not None
        assert cart.quantity == 0
        assert cart.total_price == Decimal("0")
    
    def test_cart_with_items(self, product):
        """Test d'un panier avec des articles"""
        cart = Cart.objects.create()
        product2 = baker.make(Product, price=Decimal("10.00"))
        
        cart_item1 = CartItem.objects.create(cart=cart, product=product, quantity=3)
        cart_item2 = CartItem.objects.create(cart=cart, product=product2, quantity=2)
        
        assert CartItem.objects.filter(cart=cart).count() == 2 