from django.contrib import admin
from . import models

from django.contrib import admin
from .models import Watch, WatchMedia

class WatchMediaInline(admin.TabularInline):
    model = WatchMedia
    extra = 1

class WatchAdmin(admin.ModelAdmin):
    inlines = [WatchMediaInline]

# Register your models here.
admin.site.register(models.Product)
admin.site.register(models.Collection)
admin.site.register(models.Promotion)
admin.site.register(models.Customer)
admin.site.register(models.Cart)
admin.site.register(models.CartItem)
admin.site.register(models.Order)
admin.site.register(models.OrderItem)
admin.site.register(models.Booking)
admin.site.register(models.Slots)
admin.site.register(models.Watch, WatchAdmin)
