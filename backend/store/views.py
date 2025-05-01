import os
from .models import Product, Collection, Cart, CartItem, Customer, Order, OrderItem
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
    pagination_class = None  # Désactiver explicitement la pagination

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


class CartViewSet(ModelViewSet):
    serializer_class = CartSerializer
    queryset = Cart.objects.prefetch_related('items__product').all()

class CartItemViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        return CartItem.objects.filter(cart_id=self.kwargs['cart_pk']).select_related('product')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AddCartItemSerializer
        elif self.request.method == 'PATCH':
            return UpdateCartItemSerializer
        return CartItemSerializer

    def get_serializer_context(self):
        return {'cart_id': self.kwargs['cart_pk']}
    


class CustomerViewSet(ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['name', 'email', 'phone']
    search_fields = ['name', 'email', 'phone', 'address']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        return [IsAuthenticated()]

    @action(detail=False, methods=['GET', 'PUT'], permission_classes=[IsAuthenticated])
    def me(self, request):  
        customer = Customer.objects.get(user_id=request.user.id)
        if request.method == 'GET':
            serializer = CustomerSerializer(customer)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = CustomerSerializer(customer, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class OrderViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.request.method in ['PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(data=request.data, context={'user_id': request.user.id})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateOrderSerializer
        elif self.request.method == 'PATCH':
            return UpdateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        customer = Customer.objects.get(user_id=user.id)[0]
        return Order.objects.filter(customer_id=customer.id)
    
    def get_serializer_context(self):
        return {'user_id': self.request.user.id}


class OrderItemViewSet(ModelViewSet):
    serializer_class = OrderItemSerializer
    queryset = OrderItem.objects.all()


class ProductImageViewSet(ModelViewSet):
    serializer_class = ProductImageSerializer
    
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


class SlotsViewSet(ModelViewSet):
    http_method_names = ['get']
    serializer_class = SlotsSerializer

    def get_queryset(self):
        date_str = self.request.GET.get('date')
        if not date_str:
            return Response({"error": "Missing 'date' parameter (YYYY-MM-DD)"}, status=400)
        try:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
        return Slots.objects.filter(is_available=True).filter(date=selected_date)


class BookingViewSet(ModelViewSet):
    http_method_names = ['post', 'delete', 'head', 'options']
    queryset = Booking.objects.all()
    
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
            return CreateBookingSerializer
        elif self.request.method == 'DELETE':
            return DeleteBookingSerializer

def list_watch_images(request):
    folder_path = os.path.join(settings.MEDIA_ROOT, 'store/F&W/')
    fichiers = os.listdir(folder_path)
    fichiers.sort()
    
    # Base URL pour les médias
    media_base_url = request.build_absolute_uri(settings.MEDIA_URL)
    
    grouped = {}
    
    print("===== DEBUG IMAGES =====")

    for f in fichiers:
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.webm')):
            try:
                # Déterminer le nom de base et le type (small/wide)
                if 'small' in f:
                    # Format: watch1-small-0.png -> base_name: watch1, type: small, num: 0
                    parts = f.split('-small-')
                    base_name = parts[0]
                    size = 'small'
                    num = parts[1].split('.')[0]  # Récupérer le numéro (0, 1, 2...)
                elif 'wide' in f:
                    # Format: watch1-wide-0.png -> base_name: watch1, type: wide, num: 0
                    parts = f.split('-wide-')
                    base_name = parts[0]
                    size = 'wide'
                    num = parts[1].split('.')[0]  # Récupérer le numéro (0, 1, 2...)
                else:
                    # Cas par défaut si ni small ni wide n'est spécifié
                    base_name = f.split('-')[0]
                    size = 'unknown'
                    num = '0'
                
                # Initialiser la structure si c'est la première fois qu'on rencontre ce base_name
                if base_name not in grouped:
                    grouped[base_name] = {'small': {}, 'wide': {}}
                
                # Stocker l'URL complète de l'image
                file_path = f'store/F&W/{f}'
                full_url = f"{media_base_url}{file_path}"
                
                # Ajouter un timestamp uniquement pour les images wide 1, 2 et 3
                if size == 'wide' and num in ['1', '2', '3']:
                    timestamp = int(datetime.now().timestamp())
                    full_url = f"{full_url}?t={timestamp}"
                
                # Vérifier la taille du fichier
                file_size = os.path.getsize(os.path.join(folder_path, f))
                print(f"Fichier: {f}, taille: {file_size} octets, URL: {full_url}")
                
                if size == 'small':
                    grouped[base_name]['small'][num] = full_url
                elif size == 'wide':
                    grouped[base_name]['wide'][num] = full_url
                
            except Exception as e:
                print(f"Erreur lors du traitement du fichier {f}: {str(e)}")
    
    print("=======================")
    
    return JsonResponse(grouped)










