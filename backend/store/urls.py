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
router.register('bookings', views.BookingViewSet, basename='bookings')

cart_router = NestedSimpleRouter(router, 'carts', lookup='cart')
cart_router.register('items', views.CartItemViewSet, basename='cart-items')

product_router = NestedSimpleRouter(router, 'products', lookup='product')
product_router.register('images', views.ProductImageViewSet, basename='product-images')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(cart_router.urls)),
    path('', include(product_router.urls)),
    path('watches/', views.WatchViewSet.as_view({'get': 'list'})),
    path('available_slots/', views.SlotsViewSet.as_view({'get': 'list'})),
    path('bookings/', views.BookingViewSet.as_view({'post': 'create'})),
]