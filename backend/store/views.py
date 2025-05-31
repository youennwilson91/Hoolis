import os
from .models import *
from .serializers import *
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.mixins import RetrieveModelMixin, CreateModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .filters import ProductFilter
from .permissons import IsAdminOrReadOnly
from .tasks import process_order
from django.http import HttpResponse, JsonResponse
from rest_framework.pagination import PageNumberPagination
from datetime import datetime, timedelta, time, date
from django.utils.timezone import make_aware
from django.conf import settings



class ProductViewSet(ModelViewSet):
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'title']
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = Product.objects.select_related('collection').prefetch_related('images').all()
        collection_id = self.request.query_params.get('collection_id')
        if collection_id is not None:
            queryset = queryset.filter(collection_id=collection_id)
        return queryset
    

    def get_serializer_context(self):
        return {'request': self.request}
    
    def destroy(self, request, *args, **kwargs):
        product = get_object_or_404(Product, pk=kwargs['pk'])
        if product.orderitem_set.count() > 0:   
            return Response({'error': 'Product cannot be deleted because it is associated with an order item.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        return super().destroy(request, *args, **kwargs)




class CollectionViewSet(ModelViewSet):
    queryset = Collection.objects.annotate(
        products_count=Count('product')
    )
    serializer_class = CollectionSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    permission_classes = [IsAdminOrReadOnly]
    def destroy(self, request, *args, **kwargs):
        collection = get_object_or_404(Collection, pk=kwargs['pk'])
        if collection.product_set.count() > 0:
            return Response({'error': 'Collection cannot be deleted because it includes one or more products.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        return super().destroy(request, *args, **kwargs)


class ProductImageViewSet(ModelViewSet):
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        return ProductImage.objects.filter(product_id=self.kwargs['product_pk'])

    def get_serializer_context(self):
        return {'product_id': self.kwargs['product_pk']}


def process_order_view(request, order_id):
    # Logique pour enregistrer la commande dans la base de données
    # ...
    
    # Lancer le traitement asynchrone
    process_order.delay(order_id)
    
    # Retourner une réponse immédiate à l'utilisateur
    return HttpResponse("Votre commande est en cours de traitement")

class SlotsProductViewSet(ModelViewSet):
    http_method_names = ['get']
    serializer_class = SlotsProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        date_str = self.request.GET.get('date')
        if not date_str:
            return Response({"error": "Missing 'date' parameter (YYYY-MM-DD)"}, status=400)
        try:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
        return SlotsProduct.objects.filter(is_available=True).filter(date=selected_date)


class BookingProductViewSet(ModelViewSet):
    http_method_names = ['post', 'delete', 'head', 'options']
    queryset = BookingProduct.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        return {
            'date': self.request.data.get('date'),
            'product': self.request.data.get('product'),
            'name': self.request.data.get('name'),
            'start_time': self.request.data.get('start_time'), 
            'end_time': self.request.data.get('end_time')
            }

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateBookingProductSerializer
        elif self.request.method == 'DELETE':
            return DeleteBookingProductSerializer


class SlotsWatchViewSet(ModelViewSet):
    http_method_names = ['get']
    serializer_class = SlotsWatchSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        date_str = self.request.GET.get('date')
        if not date_str:
            return Response({"error": "Missing 'date' parameter (YYYY-MM-DD)"}, status=400)
        try:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
        return SlotsWatch.objects.filter(is_available=True).filter(date=selected_date)


class BookingWatchViewSet(ModelViewSet):
    http_method_names = ['post', 'delete', 'head', 'options']
    queryset = BookingWatch.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        return {
            'date': self.request.data.get('date'),
            'watch': self.request.data.get('watch'),
            'name': self.request.data.get('name'),
            'start_time': self.request.data.get('start_time'), 
            'end_time': self.request.data.get('end_time')
            }

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateBookingWatchSerializer
        elif self.request.method == 'DELETE':
            return DeleteBookingWatchSerializer
            

class WatchViewSet(ModelViewSet):
    serializer_class = WatchSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Watch.objects.prefetch_related('images')


# class CartViewSet(ModelViewSet):
#     serializer_class = CartSerializer
#     queryset = Cart.objects.prefetch_related('items__product').all()
#     permission_classes = [IsAdminOrReadOnly]
# 
# class CartItemViewSet(ModelViewSet):
#     http_method_names = ['get', 'post', 'patch', 'delete']
#     permission_classes = [IsAdminOrReadOnly]
# 
#     def get_queryset(self):
#         return CartItem.objects.filter(cart_id=self.kwargs['cart_pk']).select_related('product')
# 
#     def get_serializer_class(self):
#         if self.request.method == 'POST':
#             return AddCartItemSerializer
#         elif self.request.method == 'PATCH':
#             return UpdateCartItemSerializer
#         return CartItemSerializer
# 
#     def get_serializer_context(self):
#         return {'cart_id': self.kwargs['cart_pk']}
#     
# 
# 
# class CustomerViewSet(ModelViewSet):
#     queryset = Customer.objects.all()
#     serializer_class = CustomerSerializer
#     filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
#     filterset_fields = ['name', 'email', 'phone']
#     search_fields = ['name', 'email', 'phone', 'address']
#     ordering_fields = ['name', 'created_at']
#     ordering = ['-created_at']
# 
#     def get_permissions(self):
#         return [IsAuthenticated()]
# 
#     @action(detail=False, methods=['GET', 'PUT'], permission_classes=[IsAuthenticated])
#     def me(self, request):  
#         customer = Customer.objects.get(user_id=request.user.id)
#         if request.method == 'GET':
#             serializer = CustomerSerializer(customer)
#             return Response(serializer.data)
#         elif request.method == 'PUT':
#             serializer = CustomerSerializer(customer, data=request.data)
#             serializer.is_valid(raise_exception=True)
#             serializer.save()
#             return Response(serializer.data)
# 
# 
# class OrderViewSet(ModelViewSet):
#     http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
# 
#     def get_permissions(self):
#         if self.request.method in ['PATCH', 'DELETE']:
#             return [IsAdminUser()]
#         return [IsAuthenticated()]
# 
#     def create(self, request, *args, **kwargs):
#         serializer = CreateOrderSerializer(data=request.data, context={'user_id': request.user.id})
#         serializer.is_valid(raise_exception=True)
#         order = serializer.save()
#         serializer = OrderSerializer(order)
#         return Response(serializer.data)
# 
#     def get_serializer_class(self):
#         if self.request.method == 'POST':
#             return CreateOrderSerializer
#         elif self.request.method == 'PATCH':
#             return UpdateOrderSerializer
#         return OrderSerializer
# 
#     def get_queryset(self):
#         user = self.request.user
#         if user.is_staff:
#             return Order.objects.all()
#         customer = Customer.objects.get(user_id=user.id)[0]
#         return Order.objects.filter(customer_id=customer.id)
#     
#     def get_serializer_context(self):
#         return {'user_id': self.request.user.id}
# 
# 
# class OrderItemViewSet(ModelViewSet):
#     serializer_class = OrderItemSerializer
#     queryset = OrderItem.objects.all()
#     permission_classes = [IsAdminOrReadOnly]







