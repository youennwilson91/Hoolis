from django.urls import path, include
from . import views
from rest_framework.routers import SimpleRouter
from rest_framework_nested.routers import NestedSimpleRouter
app_name = 'store'

router = SimpleRouter()
router.register('products', views.ProductViewSet, basename='products')
router.register('collections', views.CollectionViewSet, basename='collections')
router.register('orders', views.OrderViewSet, basename='orders')
router.register('customers', views.CustomerViewSet, basename='customers')
# BOOKING DISABLED
# router.register('bookings-products', views.BookingProductViewSet, basename='bookings-products')
# router.register('slots-products', views.SlotsProductViewSet, basename='slots-products')

order_router = NestedSimpleRouter(router, 'orders', lookup='order')
order_router.register('items', views.OrderItemViewSet, basename='order-items')

product_router = NestedSimpleRouter(router, 'products', lookup='product')
product_router.register('images', views.ProductImageViewSet, basename='product-images')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(product_router.urls)),
    # BOOKING DISABLED
    # path('bookings-products/', views.BookingProductViewSet.as_view({'post': 'create'})),
    # path('available-slots-products/', views.SlotsProductViewSet.as_view({'get': 'list'})),
    # path('send-confirmation-code/', views.send_confirmation_code),
    # path('verify-confirmation-code/', views.verify_confirmation_code),
    path('create-stripe-session/', views.create_stripe_session, name='create-stripe-session'),
    path('stripe-webhook/', views.stripe_webhook, name='stripe-webhook'),
    path('test-ip/', views.test_ip, name='test-ip'),
]