import pytest
from decimal import Decimal
from store.models import Product, Order

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

@pytest.mark.django_db
class TestOrderModel:
    # Test séparé des classes et valeurs des choix de Order
    def test_order_payment_status_choices(self):
        """Test des choix de statut de paiement de Order"""
        assert Order.PAYMENT_PENDING == 'Pending'
        assert Order.PAYMENT_COMPLETED == 'Completed'
        assert Order.PAYMENT_FAILED == 'Failed'
        assert len(Order.PAYMENT_CHOICES) == 3

    def test_order_shipping_status_choices(self):
        """Test des choix de statut d'expédition de Order"""
        assert Order.SHIPPING_PENDING == 'Pending'
        assert Order.SHIPPING_SHIPPED == 'Shipped'
        assert Order.SHIPPING_DELIVERED == 'Delivered'
        assert len(Order.SHIPPING_CHOICES) == 3 