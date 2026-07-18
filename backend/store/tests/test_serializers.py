import pytest
from decimal import Decimal
from model_bakery import baker
from store.models import Product, Collection
from store.serializers import (
    ProductSerializer,
    CollectionSerializer,
)


@pytest.mark.django_db
class TestProductSerializer:
    def test_serialize_product(self):
        """Test de sérialisation d'un produit"""
        collection = baker.make(Collection)
        product = baker.make(
            Product,
            title="Test Product",
            price=Decimal("99.99"),
            description="Test description",
            collection=collection
        )
        
        serializer = ProductSerializer(product)
        data = serializer.data
        
        assert data['id'] == product.id
        assert data['title'] == "Test Product"
        assert Decimal(data['price']) == Decimal("99.99")
        assert 'collection' in data
        assert 'id' in data['collection']
        
    def test_product_serializer_validation(self):
        """Test de validation d'un produit"""
        collection = baker.make(Collection)
        
        data = {
            'title': 'New Product',
            'price': '129.99',
            'description': 'A brand new product',
            'collection': collection.id,
            'is_available': True
        }
        
        serializer = ProductSerializer(data=data)
        assert serializer.is_valid()
        assert serializer.validated_data['title'] == 'New Product'
        assert serializer.validated_data['price'] == Decimal('129.99')
        assert serializer.validated_data['is_available'] == True
 