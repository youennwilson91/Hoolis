from django.urls import path, include
from . import views
from rest_framework.routers import SimpleRouter
from rest_framework_nested.routers import NestedSimpleRouter
app_name = 'store'

router = SimpleRouter()
router.register('products', views.ProductViewSet, basename='products')
router.register('collections', views.CollectionViewSet, basename='collections')
router.register('carts', views.CartViewSet, basename='carts')
router.register('customers', views.CustomerViewSet, basename='customers')
router.register('orders', views.OrderViewSet, basename='orders')
router.register('bookings-products', views.BookingProductViewSet, basename='bookings-products')
router.register('bookings-watches', views.BookingWatchViewSet, basename='bookings-watches')
router.register('slots-products', views.SlotsProductViewSet, basename='slots-products')
router.register('slots-watches', views.SlotsWatchViewSet, basename='slots-watches')

cart_router = NestedSimpleRouter(router, 'carts', lookup='cart')
cart_router.register('items', views.CartItemViewSet, basename='cart-items')

product_router = NestedSimpleRouter(router, 'products', lookup='product')
product_router.register('images', views.ProductImageViewSet, basename='product-images')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(cart_router.urls)),
    path('', include(product_router.urls)),
    path('watches/', views.WatchViewSet.as_view({'get': 'list'})),
    path('bookings-products/', views.BookingProductViewSet.as_view({'post': 'create'})),
    path('bookings-watches/', views.BookingWatchViewSet.as_view({'post': 'create'})),
    path('available-slots-watches/', views.SlotsWatchViewSet.as_view({'get': 'list'})),
    path('available-slots-products/', views.SlotsProductViewSet.as_view({'get': 'list'})),
    path('send-confirmation-code/', views.send_confirmation_code),
    path('verify-confirmation-code/', views.verify_confirmation_code),
    path('cancel-verification/', views.cancel_verification),
]