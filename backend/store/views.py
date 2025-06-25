import os
from .models import *
from .serializers import *
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.mixins import RetrieveModelMixin, CreateModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework import status
from rest_framework.permissions import *
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta, time, date
from django.http import HttpResponse, JsonResponse
from django.utils.timezone import make_aware
from django.conf import settings
from django.db import IntegrityError
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.views.decorators.vary import vary_on_headers

from .filters import ProductFilter
from .permissons import IsAdminOrReadOnly
from .tasks import process_order
from .utils import SafeErrorHandler, sanitize_phone_number, sanitize_text_input, log_security_event

import vonage
from django.conf import settings
import os
import logging

# Configuration du logger
logger = logging.getLogger(__name__)

@method_decorator(cache_page(3600), name='list')
@method_decorator(cache_page(3600), name='retrieve')
@method_decorator(vary_on_headers('User-Agent'), name='list')
class ProductViewSet(ModelViewSet):
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'title']
    pagination_class = PageNumberPagination
    permission_classes = [IsAdminUser]

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



@method_decorator(cache_page(3600), name='list')
@method_decorator(cache_page(3600), name='retrieve')
@method_decorator(vary_on_headers('User-Agent'), name='list')
class CollectionViewSet(ModelViewSet):
    queryset = Collection.objects.annotate(
        products_count=Count('product')
    )
    serializer_class = CollectionSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    permission_classes = [IsAdminUser]
    
    def destroy(self, request, *args, **kwargs):
        collection = get_object_or_404(Collection, pk=kwargs['pk'])
        if collection.product_set.count() > 0:
            return Response({'error': 'Collection cannot be deleted because it includes one or more products.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        return super().destroy(request, *args, **kwargs)

@method_decorator(cache_page(3600), name='list')
@method_decorator(cache_page(3600), name='retrieve')
class ProductImageViewSet(ModelViewSet):
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminUser]
    
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
    permission_classes = [IsAdminUser]

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
    permission_classes = [IsAdminUser]
    
    def get_serializer_context(self):
        return {
            'date': self.request.data.get('date'),
            'phone': self.request.data.get('phone'),
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

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError as e:
            # Vérifier si c'est une erreur de contrainte d'unicité sur le téléphone
            if 'phone' in str(e).lower():
                return Response(
                    {
                        'error': 'Ce numéro de téléphone est déjà utilisé.',
                        'detail': 'Une réservation existe déjà avec ce numéro de téléphone. Veuillez utiliser un autre numéro ou annuler votre réservation existante.'
                    },
                    status=status.HTTP_409_CONFLICT
                )
            # Pour les autres erreurs d'intégrité, on relance l'exception
            raise


class SlotsWatchViewSet(ModelViewSet):
    http_method_names = ['get']
    serializer_class = SlotsWatchSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        date_str = self.request.GET.get('date')
        if not date_str:
            return Response({"error": "Missing 'date' parameter (YYYY-MM-DD)"}, status=400)
        try:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
        return SlotsWatch.objects.filter(is_available=True).filter(date=selected_date)


# Pas de cache pour BookingWatchViewSet car il contient des opérations POST/DELETE
class BookingWatchViewSet(ModelViewSet):
    http_method_names = ['post', 'delete', 'head', 'options']
    queryset = BookingWatch.objects.all()
    permission_classes = [IsAdminUser]
    
    def get_serializer_context(self):
        return {
            'date': self.request.data.get('date'),
            'watch': self.request.data.get('watch'),
            'name': self.request.data.get('name'),
            'phone': self.request.data.get('phone'),
            'start_time': self.request.data.get('start_time'), 
            'end_time': self.request.data.get('end_time')
            }

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateBookingWatchSerializer
        elif self.request.method == 'DELETE':
            return DeleteBookingWatchSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError as e:
            # Vérifier si c'est une erreur de contrainte d'unicité sur le téléphone
            if 'phone' in str(e).lower():
                return Response(
                    {
                        'error': 'Ce numéro de téléphone est déjà utilisé.',
                        'detail': 'Une réservation existe déjà avec ce numéro de téléphone. Veuillez utiliser un autre numéro ou annuler votre réservation existante.'
                    },
                    status=status.HTTP_409_CONFLICT
                )
            # Pour les autres erreurs d'intégrité, on relance l'exception
            raise
            

@method_decorator(cache_page(60 * 30), name='list')
@method_decorator(cache_page(60 * 30), name='retrieve')
@method_decorator(vary_on_headers('User-Agent'), name='list')
class WatchViewSet(ModelViewSet):
    serializer_class = WatchSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Watch.objects.prefetch_related('images')


@api_view(['POST'])
def send_confirmation_code(request):
    try:
        phone = request.data.get('phone')
        type_reservation = request.data.get('type')
        
        # ✅ NÉCESSAIRE - Validation des données utilisateur
        if not phone:
            return SafeErrorHandler.get_safe_error_response(
                'PHONE_MISSING', 
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ NÉCESSAIRE - Sanitiser le numéro de téléphone (données utilisateur)
        sanitized_phone = sanitize_phone_number(phone)
        if not sanitized_phone:
            return SafeErrorHandler.get_safe_error_response(
                'VALIDATION_ERROR',
                f"Invalid phone format: {phone}",
                status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ NÉCESSAIRE - Sanitiser le type (données utilisateur)
        sanitized_type = sanitize_text_input(type_reservation, 50)
        
        # Logger l'activité (sans données sensibles)
        logger.info(f"SMS verification requested for type: {sanitized_type}")
        
        # Vérifier si le numéro de téléphone existe déjà en base
        phone_exists_product = BookingProduct.objects.filter(phone=sanitized_phone, is_canceled=False).exists()
        phone_exists_watch = BookingWatch.objects.filter(phone=sanitized_phone, is_canceled=False).exists()
        
        if phone_exists_product or phone_exists_watch:
            log_security_event("DUPLICATE_PHONE_ATTEMPT", f"Phone already in use", request)
            return SafeErrorHandler.get_safe_error_response(
                'PHONE_EXISTS',
                status_code=status.HTTP_409_CONFLICT
            )
        
        # Utiliser les variables d'environnement pour Vonage
        vonage_key = os.environ.get('VONAGE_API_KEY')
        vonage_secret = os.environ.get('VONAGE_API_SECRET')
        
        if not vonage_key or not vonage_secret:
            logger.error("Missing Vonage credentials in environment variables")
            return SafeErrorHandler.get_safe_error_response(
                'API_ERROR',
                "Missing API credentials",
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Initialiser le client Vonage de manière sécurisée
        client = vonage.Client(key=vonage_key, secret=vonage_secret)
        verify = vonage.Verify(client)
        response = verify.start_verification(number=sanitized_phone, brand="Hoolis - F&W")
        
        logger.info(f"Vonage response status: {response.get('status')}")
        
        if response.get("status") == "0":
            return Response({
                "message": "Code envoyé", 
                "request_id": response.get("request_id")  # ❌ PAS de sanitisation - données internes Vonage
            })
        else:
            logger.warning(f"Vonage error: {response.get('error_text')}")
            return SafeErrorHandler.get_safe_error_response(
                'VONAGE_ERROR',
                f"Vonage error: {response.get('error_text')}",  # ✅ Loggé mais pas exposé
                status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        return SafeErrorHandler.handle_exception(e, "send_confirmation_code")


@api_view(['POST'])
def verify_confirmation_code(request):
    try:
        request_id = request.data.get('request_id')
        code = request.data.get('code')
        
        # ✅ NÉCESSAIRE - Validation des données utilisateur
        if not request_id or not code:
            return SafeErrorHandler.get_safe_error_response(
                'MISSING_FIELDS',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ NÉCESSAIRE - Sanitiser les entrées utilisateur
        sanitized_request_id = sanitize_text_input(request_id, 100)  # Données utilisateur
        sanitized_code = sanitize_text_input(code, 10)  # Données utilisateur
        
        # Utiliser les variables d'environnement
        vonage_key = os.environ.get('VONAGE_API_KEY')
        vonage_secret = os.environ.get('VONAGE_API_SECRET')
        
        if not vonage_key or not vonage_secret:
            logger.error("Missing Vonage credentials in environment variables")
            return SafeErrorHandler.get_safe_error_response(
                'API_ERROR',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        client = vonage.Client(key=vonage_key, secret=vonage_secret)
        verify = client.verify
        response = verify.check(request_id=sanitized_request_id, code=sanitized_code)

        if response.get("status") == "0":
            logger.info("SMS verification successful")
            return Response({
                "message": "Code de vérification valide", 
                "event_id": response.get("event_id")  # ❌ PAS de sanitisation - données internes Vonage
            })
        else:
            log_security_event("INVALID_VERIFICATION_CODE", f"Failed verification attempt", request)
            return SafeErrorHandler.get_safe_error_response(
                'INVALID_CODE',
                f"Verification failed: {response.get('error_text')}",  # ✅ Loggé mais pas exposé
                status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        return SafeErrorHandler.handle_exception(e, "verify_confirmation_code")


@api_view(['POST'])
def cancel_verification(request):
    try:
        request_id = request.data.get('request_id')
        
        if not request_id:
            return SafeErrorHandler.get_safe_error_response(
                'MISSING_FIELDS',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ NÉCESSAIRE - Sanitiser les données utilisateur
        sanitized_request_id = sanitize_text_input(request_id, 100)
        
        # Utiliser les variables d'environnement
        vonage_key = os.environ.get('VONAGE_API_KEY')
        vonage_secret = os.environ.get('VONAGE_API_SECRET')
        
        if not vonage_key or not vonage_secret:
            logger.error("Missing Vonage credentials in environment variables")
            return SafeErrorHandler.get_safe_error_response(
                'API_ERROR',
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        client = vonage.Client(key=vonage_key, secret=vonage_secret)
        verify = client.verify
        response = verify.cancel(REQUEST_ID=sanitized_request_id)
        
        logger.info("SMS verification cancelled")
        return Response({"message": "Vérification annulée"})
    
    except Exception as e:
        return SafeErrorHandler.handle_exception(e, "cancel_verification")


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







