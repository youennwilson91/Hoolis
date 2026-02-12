from rest_framework import serializers
from .models import *
from decimal import Decimal
from . import order_created
from .utils import sanitize_text_input
import logging

logger = logging.getLogger(__name__)

class CollectionSerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Collection
        fields = ['id', 'name', 'products_count', 'is_resell']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

    def create(self, validated_data):
        product_id = self.context['product_id']
        return ProductImage.objects.create(product_id=product_id, **validated_data)

class ProductSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField(method_name='calculate_total_price')
    collection = CollectionSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    def calculate_total_price(self, product: Product):
        return product.price * Decimal(1.1)
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix doit être positif")
        return value

    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'description', 'collection', 'is_available', 'is_resell', 'total_price', 'images']


class SimpleProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title', 'price']


# BOOKING DISABLED
# class SlotsProductSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = SlotsProduct
#         fields = ['date', 'start_time', 'end_time', 'is_available']


# class CreateBookingProductSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BookingProduct
#         fields = ['name', 'phone', 'product', 'date', 'start_time', 'end_time']

#     def validate_name(self, value):
#         if not value or len(value.strip()) == 0:
#             raise serializers.ValidationError("Le nom est requis")

#         sanitized = sanitize_text_input(value, 100)
#         if len(sanitized) < 2:
#             raise serializers.ValidationError("Le nom doit contenir au moins 2 caractères")

#         return sanitized

#     def validate_phone(self, value):
#         sanitized = sanitize_phone_number(value)
#         if not sanitized:
#             raise serializers.ValidationError("Format de numéro de téléphone invalide")

#         # Vérifier l'unicité en déchiffrant tous les numéros existants
#         existing_bookings = BookingProduct.objects.all()
#         for booking in existing_bookings:
#             if booking.phone == sanitized:  # django-cryptography déchiffre automatiquement
#                 raise serializers.ValidationError("Ce numéro de téléphone est déjà utilisé pour une réservation produit")

#         return sanitized

#     def validate_product(self, value):
#         if value:
#             return sanitize_text_input(value, 200)
#         return value

#     def create(self, validated_data):
#         booking = BookingProduct.objects.create(**validated_data)
#         SlotsProduct.objects.filter(
#             date=validated_data['date'],
#             start_time=validated_data['start_time'],
#             end_time=validated_data['end_time']).update(is_available=False)
#         return booking

# class DeleteBookingProductSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BookingProduct
#         fields = ['name', 'phone', 'date', 'start_time', 'end_time']

#     def update(self):
#         # Chercher le booking en déchiffrant tous les numéros de téléphone
#         bookings_candidates = BookingProduct.objects.filter(
#             name=self.context['name'],
#             start_time=self.context['start_time'],
#             end_time=self.context['end_time']
#         )

#         instance = None
#         for booking in bookings_candidates:
#             if booking.phone == self.context['phone']:  # django-cryptography déchiffre automatiquement
#                 instance = booking
#                 break

#         if not instance:
#             raise serializers.ValidationError("Aucune réservation trouvée avec ces informations")

#         instance.is_canceled = True
#         instance.save()
#         return instance



class CustomerSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    class Meta:
        model = Customer
        fields = ['user_id', 'name', 'email', 'phone', 'address', 'has_payed']


class OrderItemSerializer(serializers.ModelSerializer):
    product = SimpleProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'order_items', 'total_price', 'created_at', 'payment_status', 'shipping_status']


class UpdateOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['payment_status', 'shipping_status']

# BOOKING DISABLED
# class EmailConfirmationCodeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = EmailConfirmationCode
#         fields = ['email', 'code', 'verified']