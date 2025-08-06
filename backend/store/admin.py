from django.contrib import admin
from . import models

from django.contrib import admin
from .models import Watch, WatchMedia, Product, ProductImage, Cart, CartItem, Order, OrderItem

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ['title', 'price', 'collection', 'is_available']
    list_editable = ['price', 'collection', 'is_available']
    list_filter = ['collection', 'is_available']
    search_fields = ['title', 'description', 'collection__name']

class WatchMediaInline(admin.TabularInline):
    model = WatchMedia
    extra = 1
    

class WatchAdmin(admin.ModelAdmin):
    inlines = [WatchMediaInline]
    search_fields = ['title', 'description', 'collection__name']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    list_display = ['product', 'price', 'total_price', 'quantity']
    extra = 0

    def price(self, obj):
        return obj.product.price 

    def total_price(self, obj):
        return obj.product.price * obj.quantity

class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ['id', 'total_price', 'quantity', 'payment_status', 'shipping_status', 'created_at']
    list_filter = ['payment_status', 'shipping_status']
    search_fields = ['customer__name', 'customer__email']


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1

class CartAdmin(admin.ModelAdmin):
    inlines = [CartItemInline]
    list_display = ['id', 'total_price']

# Register your models here.
admin.site.register(models.Product, ProductAdmin)
admin.site.register(models.Collection)
# admin.site.register(models.Promotion)
admin.site.register(models.Customer)
admin.site.register(models.Cart, CartAdmin)
#admin.site.register(models.CartItem)
admin.site.register(models.Order, OrderAdmin)
#admin.site.register(models.OrderItem)
admin.site.register(models.BookingProduct)
admin.site.register(models.SlotsProduct)
admin.site.register(models.Watch, WatchAdmin)
admin.site.register(models.BookingWatch)
admin.site.register(models.SlotsWatch)
