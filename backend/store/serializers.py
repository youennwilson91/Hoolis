from rest_framework import serializers  
from .models import *
from decimal import Decimal
from django.db import transaction
from . import order_created

class CollectionSerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Collection
        fields = ['id', 'name', 'products_count']

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

    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'description', 'collection', 'promotion', 'is_available', 'total_price', 'images']
    
class SimpleProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title', 'price']

class AddCartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField()

    def validate_product_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError('No product with the given ID was found.')
        return value

    def save(self, **kwargs):
        cart_id = self.context['cart_id']
        product_id = self.validated_data['product_id']
        quantity = self.validated_data['quantity']

        try:
            cart_item = CartItem.objects.get(cart_id=cart_id, product_id=product_id)
            cart_item.quantity += quantity
            cart_item.save()
            self.instance = cart_item
        except CartItem.DoesNotExist:
            self.instance = CartItem.objects.create(cart_id=cart_id, **self.validated_data)
        return self.instance
    
    class Meta:
        model = CartItem
        fields = ['id', 'product_id', 'quantity']


class UpdateCartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['quantity']


class CartItemSerializer(serializers.ModelSerializer):
    product = SimpleProductSerializer(read_only=True)
    total_price = serializers.SerializerMethodField(method_name='get_total_price')

    def get_total_price(self, cart_item: CartItem):
        return cart_item.product.price * cart_item.quantity 

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'total_price']


class CartSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField(method_name='get_total_price')

    def get_total_price(self, cart: Cart):
        return sum(item.quantity * item.product.price for item in cart.items.all())

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price']


class CustomerSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    class Meta:
        model = Customer
        fields = ['user_id', 'name', 'email', 'phone', 'address']


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


class CreateOrderSerializer(serializers.ModelSerializer):
    cart_id = serializers.UUIDField()

    class Meta:
        model = Order
        fields = ['cart_id']

    def validate_cart_id(self, value):
        if not Cart.objects.filter(pk=value).exists():
            raise serializers.ValidationError('No cart with the given ID was found.')
        if CartItem.objects.filter(cart__id=value).count() == 0:
            raise serializers.ValidationError('The cart is empty.')
        return value

    def save(self, **kwargs):
        with transaction.atomic():
            cart_id = self.validated_data['cart_id']
            customer = Customer.objects.get(user_id=self.context['user_id'])
            order = Order.objects.create(customer=customer)
            
            cart_items = CartItem.objects.select_related('product').filter(cart__id=cart_id)
            
            order_items = [
                OrderItem(
                    order=order,
                    product=item.product,
                    quantity=item.quantity
                )
                for item in cart_items
            ]
            OrderItem.objects.bulk_create(order_items)

            Cart.objects.filter(pk=cart_id).delete()

            order_created.send(sender=self.__class__, order=order)
            
            return order


class UpdateOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['payment_status', 'shipping_status']


class SlotsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slots
        fields = ['date', 'start_time', 'end_time', 'is_available']


class CreateBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['name', 'watch', 'date', 'start_time', 'end_time']
    
    def create(self, validated_data):
        if Booking.objects.filter(
                date=validated_data['date'], 
                watch=validated_data['watch'],
                start_time=validated_data['start_time'], 
                end_time=validated_data['end_time']).exists():
            raise serializers.ValidationError('This time slot is already booked.')
        booking = Booking.objects.create(**validated_data)
        Slots.objects.filter(
            date=validated_data['date'], 
            start_time=validated_data['start_time'], 
            end_time=validated_data['end_time']).update(is_available=False)
        return booking

class DeleteBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['name', 'date', 'start_time', 'end_time']

    def update(self):
        instance = Booking.objects.get(
            name=self.context['name'], 
            start_time=self.context['start_time'], 
            end_time=self.context['end_time']
            )
        instance.is_canceled = True
        instance.save()
        return instance


