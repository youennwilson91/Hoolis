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

from .filters import ProductFilter
from .permissons import IsAdminOrReadOnly
from .tasks import process_order

import vonage
from django.conf import settings
import os



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
            

class WatchViewSet(ModelViewSet):
    serializer_class = WatchSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Watch.objects.prefetch_related('images')




@api_view(['POST'])
def send_confirmation_code(request):
    phone = request.data.get('phone')
    type = request.data.get('type')  
    print(f"Numéro de téléphone reçu: {phone}")
    print(f"Type de réservation: {type}")
    
    if not phone:
        print("Erreur: Numéro manquant")
        return Response({"error": "Numéro manquant"}, status=400)

    # Vérifier si le numéro de téléphone existe déjà en base
    phone_exists_product = BookingProduct.objects.filter(phone=phone, is_canceled=False).exists()
    phone_exists_watch = BookingWatch.objects.filter(phone=phone, is_canceled=False).exists()
    
    if phone_exists_product or phone_exists_watch:
        print(f"Numéro de téléphone {phone} déjà utilisé")
        return Response({
            "error": "Ce numéro de téléphone est déjà utilisé.",
            "detail": "Une réservation existe déjà avec ce numéro de téléphone. Veuillez utiliser un autre numéro ou contactez nous pour reprogrammer votre rendez-vous."
        }, status=409)
    try:
        print("Tentative d'envoi du code via Vonage...")
        client = vonage.Client(key='6276d2bf', secret='R4NpzwZD9Y3Fu88l')
        verify = vonage.Verify(client)
        response = verify.start_verification(number=phone, brand="Hoolis - F&W")

        print(f"Réponse Vonage: {response}")
        
        if response["status"] == "0":
            print(f"Code envoyé avec succès, request_id: {response['request_id']}")
            return Response({"message": "Code envoyé", "request_id": response["request_id"]})
        else:
            print(f"Erreur Vonage: {response.get('error_text', 'Erreur inconnue')}")
            return Response({"error": response.get("error_text", "Erreur lors de l'envoi du code")}, status=400)
    
    except Exception as e:
        print(f"Exception lors de l'envoi du code: {str(e)}")
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def verify_confirmation_code(request):
    client = vonage.Client(key='6276d2bf', secret='R4NpzwZD9Y3Fu88l')
    verify = client.verify
    response = verify.check(request_id=request.data.get('request_id'), code=request.data.get('code'))

    if response["status"] == "0":
        return Response({"message": "Code de vérification valide", "event_id": response["event_id"]})
    else:
        return Response({"error": response["error_text"]}, status=400)



@api_view(['POST'])
def cancel_verification(request):
    client = vonage.Client(key='6276d2bf', secret='R4NpzwZD9Y3Fu88l')
    verify = client.verify
    response = verify.cancel(REQUEST_ID=request.data.get('request_id'))





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







