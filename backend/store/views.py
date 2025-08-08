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

    # External libraries
import stripe
import vonage
import logging

# Configuration du logger
logger = logging.getLogger(__name__)

@method_decorator(cache_page(60 * 10), name='list')
@method_decorator(cache_page(60 * 10), name='retrieve')
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



@method_decorator(cache_page(60 * 10), name='list')
@method_decorator(cache_page(60 * 10), name='retrieve')
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

@method_decorator(cache_page(60 * 10), name='list')
@method_decorator(cache_page(60 * 10), name='retrieve')
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
            

@method_decorator(cache_page(60 * 10), name='list')
@method_decorator(cache_page(60 * 10), name='retrieve')
@method_decorator(vary_on_headers('User-Agent'), name='list')
class WatchViewSet(ModelViewSet):
    serializer_class = WatchSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Watch.objects.prefetch_related('images')


class CartViewSet(ModelViewSet):
    serializer_class = CartSerializer
    queryset = Cart.objects.prefetch_related('items__product').all()
    permission_classes = [IsAdminOrReadOnly]

class CartItemViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'patch', 'delete']
    permission_classes = [IsAdminOrReadOnly]

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
    permission_classes = [IsAdminOrReadOnly]


    ###### SMS ######

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
        # On ne peut pas utiliser filter() directement sur un champ chiffré
        phone_exists_product = False
        for booking in BookingProduct.objects.filter(is_canceled=False):
            if booking.phone == sanitized_phone:  # django-cryptography déchiffre automatiquement
                phone_exists_product = True
                break
        
        phone_exists_watch = False
        if not phone_exists_product:  # Optimisation : on check seulement si pas trouvé dans products
            for booking in BookingWatch.objects.filter(is_canceled=False):
                if booking.phone == sanitized_phone:  # django-cryptography déchiffre automatiquement
                    phone_exists_watch = True
                    break
        
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


@api_view(['POST'])
def create_stripe_session(request):
    """
    Créer session Stripe pour watch_id ou cart_id
    """
    try:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        
        if not stripe.api_key:
            return Response(
                {"error": "Configuration Stripe manquante"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        data = request.data
        customer_data = data.get('customer', {})
        watch_id = data.get('watch_id')
        cart_id = data.get('cart_id')
        
        if not customer_data.get('email'):
            return Response(
                {"error": "Email client requis"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if watch_id:
            try:
                watch = Watch.objects.get(id=watch_id)
            except Watch.DoesNotExist:
                return Response(
                    {"error": "Montre non trouvée"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if watch.price <= 0:
                return Response(
                    {"error": "Prix invalide"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            line_items = [{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': sanitize_text_input(watch.name),
                        'description': sanitize_text_input(watch.description[:100]),
                    },
                    'unit_amount': int(watch.price * 100),
                },
                'quantity': 1,
            }]
            
            if settings.DEBUG:
                success_url = "http://localhost:5173/fw?payment=success&session_id={CHECKOUT_SESSION_ID}"
                cancel_url = "http://localhost:5173/fw?payment=cancelled"
            else:
                success_url = "https://hoolis-frontend.onrender.com/fw?payment=success&session_id={CHECKOUT_SESSION_ID}"
                cancel_url = "https://hoolis-frontend.onrender.com/fw?payment=cancelled"
            
            metadata = {
                'type': 'watch_purchase',
                'watch_id': str(watch_id),
                'watch_name': sanitize_text_input(watch.name),
                'customer_first_name': sanitize_text_input(customer_data.get('firstName', '')),
                'customer_last_name': sanitize_text_input(customer_data.get('lastName', '')),
                'customer_phone': sanitize_text_input(customer_data.get('phone', '')),
                'customer_address': sanitize_text_input(customer_data.get('address', '')),
                'customer_city': sanitize_text_input(customer_data.get('city', '')),
                'customer_postal_code': sanitize_text_input(customer_data.get('postalCode', '')),
                'customer_country': sanitize_text_input(customer_data.get('country', '')),
            }
            
        elif cart_id:
            try:
                cart = Cart.objects.prefetch_related('items__product').get(id=cart_id)
            except Cart.DoesNotExist:
                return Response(
                    {"error": "Panier non trouvé"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if not cart.items.exists():
                return Response(
                    {"error": "Panier vide"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            line_items = []
            total_amount = 0
            
            for cart_item in cart.items.all():
                item_total = int(cart_item.product.price * cart_item.quantity * 100)
                total_amount += item_total
                
                line_items.append({
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {
                            'name': sanitize_text_input(cart_item.product.title),
                            'description': sanitize_text_input(cart_item.product.description[:100]),
                        },
                        'unit_amount': int(cart_item.product.price * 100),
                    },
                    'quantity': cart_item.quantity,
                })
            
            if total_amount <= 0:
                return Response(
                    {"error": "Montant invalide"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if settings.DEBUG:
                success_url = "http://localhost:5173/hoolis?payment=success&session_id={CHECKOUT_SESSION_ID}"
                cancel_url = "http://localhost:5173/hoolis?payment=cancelled"
            else:
                success_url = "https://hoolis-frontend.onrender.com/hoolis?payment=success&session_id={CHECKOUT_SESSION_ID}"
                cancel_url = "https://hoolis-frontend.onrender.com/hoolis?payment=cancelled"
            
            metadata = {
                'type': 'cart_purchase',
                'cart_id': str(cart_id),
                'customer_first_name': sanitize_text_input(customer_data.get('firstName', '')),
                'customer_last_name': sanitize_text_input(customer_data.get('lastName', '')),
                'customer_phone': sanitize_text_input(customer_data.get('phone', '')),
                'customer_address': sanitize_text_input(customer_data.get('address', '')),
                'customer_city': sanitize_text_input(customer_data.get('city', '')),
                'customer_postal_code': sanitize_text_input(customer_data.get('postalCode', '')),
                'customer_country': sanitize_text_input(customer_data.get('country', '')),
                'total_items': str(cart.items.count()),
            }
            
        else:
            return Response(
                {"error": "watch_id ou cart_id requis"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=customer_data.get('email', '').strip(),
            billing_address_collection='required',
            shipping_address_collection={
                'allowed_countries': ['FR', 'BE', 'CH', 'LU'],
            },
            phone_number_collection={
                'enabled': True,
            },
            metadata=metadata
        )
        
        logger.info(f"Session Stripe créée: {session.id}")
        
        return Response({
            'checkout_url': session.url,
            'session_id': session.id
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Erreur Stripe: {str(e)}")
        return Response(
            {"error": "Erreur création session"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    except Exception as e:
        return SafeErrorHandler.handle_exception(e, "create_stripe_session")


@api_view(['POST'])
def verify_payment(request):
    """
    Vérifier le paiement Stripe et créer une commande
    """
    try:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        
        if not stripe.api_key:
            return Response(
                {"error": "Configuration Stripe manquante"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        session_id = request.data.get('session_id')
        if not session_id:
            return Response(
                {"error": "Session ID manquant"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"Vérification paiement: {session_id}")
        
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            logger.info(f"Session récupérée - Status: {session.payment_status}, Amount: {session.amount_total/100}€")
        except stripe.error.InvalidRequestError as e:
            logger.error(f"Session Stripe invalide: {session_id} - {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Session de paiement invalide'
            }, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.StripeError as e:
            logger.error(f"Erreur Stripe lors récupération session: {str(e)}")
            raise  # Re-lancer pour être capturé par le except général
        
        if session.payment_status == 'paid':
            logger.info("=== DÉBUT TRAITEMENT PAIEMENT RÉUSSI ===")
            
            # Étape 1: Récupération métadonnées
            metadata = session.metadata
            payment_type = metadata.get('type')
            
            # Import User model
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            # Récupération données client
            customer_email = session.customer_email
            customer_name = f"{metadata.get('customer_first_name', '')} {metadata.get('customer_last_name', '')}".strip()
            
            # Création/récupération utilisateur
            try:
                user, created = User.objects.get_or_create(
                    email=customer_email,
                    defaults={
                        'username': customer_email,
                        'first_name': metadata.get('customer_first_name', ''),
                        'last_name': metadata.get('customer_last_name', ''),
                    }
                )
                logger.info(f"Utilisateur {'créé' if created else 'récupéré'}: {user.id}")
            except Exception as user_error:
                logger.error(f"ERREUR création utilisateur: {str(user_error)}")
                raise
            
            customer, created = Customer.objects.get_or_create(
                user=user,
                defaults={
                    'name': (customer_name or '')[:199],
                    'email': (customer_email or '')[:199],
                    'phone': (metadata.get('customer_phone', '') or '')[:199],
                    'address': '',
                }
            )
            logger.info(f"Customer {'créé' if created else 'récupéré'}: {customer.name}")
            
            if payment_type == 'watch_purchase':
                watch_id = metadata.get('watch_id')
                
                try:
                    watch = Watch.objects.get(id=watch_id)
                    logger.info(f"Montre trouvée: {watch.name} - {watch.price}€")
                except Watch.DoesNotExist:
                    logger.error(f"Montre non trouvée - ID: {watch_id}")
                    return Response({
                        'status': 'error',
                        'message': 'Montre non trouvée'
                    }, status=status.HTTP_404_NOT_FOUND)

                # Création commande
                order = Order.objects.create(
                    customer=customer,
                    quantity=1,
                    total_price=session.amount_total / 100,
                    payment_status=Order.PAYMENT_COMPLETED
                )
                
                # Créer produit générique et order item
                default_collection = Collection.objects.first()
                if not default_collection:
                    default_collection = Collection.objects.create(name='Défaut', description='Collection par défaut')
                
                product, created = Product.objects.get_or_create(
                    title=watch.name,
                    defaults={
                        'price': watch.price,
                        'description': watch.description,
                        'collection': default_collection,
                        'is_available': True
                    }
                )
                
                OrderItem.objects.create(order=order, product=product, quantity=1)
                
                # Marquer montre indisponible
                watch.is_available = False
                watch.save()
                
                email_subject = f'Commande confirmée #{order.id} - F&W'
                products_details = [f"1x {watch.name} - {watch.price}€"]
                
            elif payment_type == 'cart_purchase':
                cart_id = metadata.get('cart_id')
                
                serializer = CreateOrderSerializer(
                    data={'cart_id': cart_id}, 
                    context={'user_id': user.id}
                )
                
                if not serializer.is_valid():
                    logger.error(f"Serializer invalide: {serializer.errors}")
                    return Response({
                        'status': 'error',
                        'message': 'Erreur création commande'
                    })
                
                order = serializer.save()
                order.payment_status = Order.PAYMENT_COMPLETED
                order.total_price = session.amount_total / 100
                order.save()
                
                email_subject = f'Commande confirmée #{order.id} - Hoolis'
                products_details = []
                for item in order.order_items.all():
                    products_details.append(f"{item.quantity}x {item.product.title} - {item.product.price}€")
            
            # Envoi email de confirmation
            try:
                import requests
                
                form_data = {
                    'firstName': metadata.get('customer_first_name', ''),
                    'lastName': metadata.get('customer_last_name', ''),
                    'email': customer_email,
                    'phone': metadata.get('customer_phone', ''),
                    'address': metadata.get('customer_address', ''),
                    'city': metadata.get('customer_city', ''),
                    'postalCode': metadata.get('customer_postal_code', ''),
                    'country': metadata.get('customer_country', ''),
                    'orderId': str(order.id),
                    'products': ' | '.join(products_details),
                    'totalPrice': f"{order.total_price}€",
                    'paymentId': session.payment_intent,
                    '_subject': email_subject,
                    '_captcha': 'false',
                    '_template': 'table'
                }
                
                response = requests.post(
                    'https://formsubmit.co/youson91@hotmail.fr',
                    data=form_data,
                    timeout=30
                )
                
                if response.status_code == 200:
                    logger.info("Email envoyé avec succès")
                else:
                    logger.warning(f"Email - Status code: {response.status_code}")
                
            except Exception as email_error:
                logger.error(f"Erreur envoi email: {str(email_error)}")
            
            logger.info(f"Paiement traité avec succès - Order #{order.id} - {order.total_price}€")
            
            return Response({
                'status': 'success',
                'payment_status': session.payment_status,
                'order_id': order.id,
                'message': 'Commande créée'
            })
        
        elif session.payment_status == 'unpaid':
            logger.warning(f"Paiement non payé - Status: {session.payment_status}")
            return Response({
                'status': 'pending',
                'payment_status': session.payment_status,
                'message': 'Paiement en attente'
            })
            
        else:
            logger.error(f"Statut de paiement inattendu: {session.payment_status}")
            return Response({
                'status': 'failed',
                'payment_status': session.payment_status,
                'message': 'Paiement échoué'
            })
    
    except stripe.error.StripeError as e:
        logger.error(f"Erreur Stripe: {str(e)}")
        return Response(
            {"error": "Erreur vérification paiement"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    except Exception as e:
        return SafeErrorHandler.handle_exception(e, "verify_payment")

