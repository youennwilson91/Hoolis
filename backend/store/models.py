from django.db import models
import uuid 
from django.core.validators import MinValueValidator
from django.conf import settings
from .validators import validate_file_size
from datetime import datetime
# Create your models here.

class Product(models.Model):
    title = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    collection = models.ForeignKey('Collection', on_delete=models.PROTECT)
    #promotion = models.ForeignKey('Promotion', on_delete=models.PROTECT, null=True, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='store/Shop/Articles/', validators=[validate_file_size])
    

    def __str__(self):
        return f"{self.product.title} - {self.image.name}"

class Collection(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    featured_product = models.ForeignKey('Product', on_delete=models.SET_NULL, null=True, blank=True, related_name='+')

    def __str__(self):
        return self.name

class BookingProduct(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=100, default='0000000000', unique=True)
    product = models.CharField(max_length=100, default='product')
    date = models.DateField(default=datetime.now)
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_canceled = models.BooleanField(default=False)

    class Meta:
        unique_together = ('date', 'start_time', 'end_time')  # évite les doublons pour la même date, et les mêmes heures
        ordering = ['start_time']

    def __str__(self):
        return f"{self.name} ({self.start_time} → {self.end_time})"


class SlotsProduct(models.Model):
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.start_time} → {self.end_time}"

class Watch(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name


class WatchMedia(models.Model):
    watch = models.ForeignKey(Watch, on_delete=models.CASCADE, related_name='images')
    media = models.FileField(upload_to='store/F&W/')
    size = models.CharField(max_length=100, default='small', choices=[('small', 'Small'), ('wide', 'Wide')])
    type = models.CharField(max_length=100, default='image', choices=[('image', 'Image'), ('video', 'Video')])

    def __str__(self):
        return f"{self.watch.name}"


class BookingWatch(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=100, default='0000000000', unique=True)
    watch = models.CharField(max_length=100, default='watch')
    date = models.DateField(default=datetime.now)
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_canceled = models.BooleanField(default=False)

    class Meta:
        unique_together = ('date', 'start_time', 'end_time')  # évite les doublons pour la même date, montre et les mêmes heures
        ordering = ['start_time']

    def __str__(self):
        return f"{self.name} ({self.start_time} → {self.end_time})"


class SlotsWatch(models.Model):
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.start_time} → {self.end_time}"


# class Promotion(models.Model):
#     name = models.CharField(max_length=200)
#     description = models.TextField()
#     discount = models.DecimalField(max_digits=10, decimal_places=2)
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return self.name
    
#class Customer(models.Model):
#    name = models.CharField(max_length=200, null=False, blank=False)
#    email = models.EmailField(max_length=200, null=False, blank=False)
#    phone = models.CharField(max_length=200, null=False, blank=False)
#    address = models.CharField(max_length=200, null=False, blank=False)
#    created_at = models.DateTimeField(auto_now_add=True)
#    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
#
#    def __str__(self):
#        return self.name
#
#    class Meta:
#        db_table = 'customers'
#        indexes = [
#            models.Index(fields=['name', 'email']),
#        ]
#
#class Cart(models.Model):
#    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4)
#    quantity = models.PositiveSmallIntegerField(null=True, blank=True, default=0)
#    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0)
#
#    def __str__(self):
#        return f"Cart {self.id}"
#    
#class CartItem(models.Model):
#    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
#    product = models.ForeignKey(Product, on_delete=models.CASCADE)
#    quantity = models.PositiveSmallIntegerField(
#        validators=[MinValueValidator(1)]
#    )
#    created_at = models.DateTimeField(auto_now_add=True)
#
#    def __str__(self):
#        return f"{self.quantity} x {self.product.title}" 
#
#    class Meta:
#        unique_together = [['cart', 'product']]
#
#class Order(models.Model):
#    PAYMENT_PENDING = 'P'
#    PAYMENT_COMPLETED = 'C'
#    PAYMENT_FAILED = 'F'
#    PAYMENT_CHOICES = [
#        (PAYMENT_PENDING, 'Pending'),
#        (PAYMENT_COMPLETED, 'Completed'),
#        (PAYMENT_FAILED, 'Failed'),
#    ]
#
#    SHIPPING_PENDING = 'P'
#    SHIPPING_SHIPPED = 'S'
#    SHIPPING_DELIVERED = 'D'
#    SHIPPING_CHOICES = [
#        (SHIPPING_PENDING, 'Pending'),
#        (SHIPPING_SHIPPED, 'Shipped'),
#        (SHIPPING_DELIVERED, 'Delivered'),
#    ]
#
#    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, to_field='user')
#    quantity = models.IntegerField(default=0)
#    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#    created_at = models.DateTimeField(auto_now_add=True)
#    payment_status = models.CharField(max_length=1, choices=PAYMENT_CHOICES, default=PAYMENT_PENDING)
#    shipping_status = models.CharField(max_length=1, choices=SHIPPING_CHOICES, default=SHIPPING_PENDING)
#
#    def __str__(self):
#        return f"Commande #{self.id} - {self.customer.name} - {self.total_price}€"
#
#class OrderItem(models.Model):
#    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='order_items')
#    product = models.ForeignKey(Product, on_delete=models.PROTECT)
#    quantity = models.IntegerField(default=0)
#    created_at = models.DateTimeField(auto_now_add=True)
#
#    def __str__(self):
#        return f"{self.quantity} x {self.product.title}"
