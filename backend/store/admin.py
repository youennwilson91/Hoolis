from django.contrib import admin
from .models import Product, ProductImage, Order, OrderItem, Collection, Customer

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ['title', 'price', 'collection', 'is_available']
    list_editable = ['price', 'collection', 'is_available']
    list_filter = ['collection', 'is_available']
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

class OrderInline(admin.TabularInline):
    model = Order
    extra = 0

class CustomerAdmin(admin.ModelAdmin):
    inlines = [OrderInline]
    list_display = ['name', 'email', 'phone', 'address']
    search_fields = ['name', 'email', 'phone', 'address']


# BOOKING DISABLED
# class EmailConfirmationCodeAdmin(admin.ModelAdmin):
#     model = models.EmailConfirmationCode
#     list_display = ['email', 'code', 'verified']
#     search_fields = ['email', 'code', 'verified']
#     list_filter = ['verified']



# Register your models here.
admin.site.register(Product, ProductAdmin)
admin.site.register(Collection)
# admin.site.register(models.Promotion)
admin.site.register(Customer, CustomerAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem)
# BOOKING DISABLED
# admin.site.register(models.BookingProduct)
# admin.site.register(models.SlotsProduct)
# admin.site.register(models.EmailConfirmationCode)