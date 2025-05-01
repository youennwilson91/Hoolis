import pytest
from model_bakery import baker
from .models import Product, Promotion, Collection

@pytest.mark.django_db
def test_product_creation():
    # Create a product using model_bakery
    product = baker.make(Product)
    
    # Check that the product was created
    assert Product.objects.count() == 1
    assert product.title is not None
    assert product.price is not None
    
@pytest.mark.django_db
def test_product_with_promotion():
    # Create a product with a specific promotion
    promotion = baker.make(Promotion, name="Summer Sale", discount=10.00)
    product = baker.make(Product, promotion=promotion, price=100.00)
    
    # Check that the promotion was correctly linked
    assert product.promotion.name == "Summer Sale"
    assert product.promotion.discount == 10.00 