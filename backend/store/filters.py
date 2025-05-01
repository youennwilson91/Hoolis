from django_filters.rest_framework import FilterSet
from django_filters import rest_framework as filters
from .models import Product

class ProductFilter(FilterSet):
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    class Meta:
        model = Product
        fields = ['collection_id', 'is_available', 'min_price', 'max_price']
            
