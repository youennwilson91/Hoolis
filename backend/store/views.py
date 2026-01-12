import os
import random
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
from django.contrib.auth import get_user_model

from .filters import ProductFilter
from .permissons import IsAdminOrReadOnly
from .tasks import process_order
from .utils import SafeErrorHandler, sanitize_phone_number, sanitize_text_input, log_security_event

    # External libraries
import stripe
import vonage
import logging
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

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
    #permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Product.objects.select_related('collection').prefetch_related('images')
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
    #permission_classes = [IsAdminUser]
    
    def destroy(self, request, *args, **kwargs):
        collection = get_object_or_404(Collection, pk=kwargs['pk'])
        if collection.product_set.count() > 0:
            return Response({'error': 'Collection cannot be deleted because it includes one or more products.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        return super().destroy(request, *args, **kwargs)

@method_decorator(cache_page(60 * 10), name='list')
@method_decorator(cache_page(60 * 10), name='retrieve')
class ProductImageViewSet(ModelViewSet):
    serializer_class = ProductImageSerializer
    #permission_classes = [IsAdminUser]
    
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
    #permission_classes = [IsAdminUser]

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
    #permission_classes = [IsAdminUser]
    
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



class CartViewSet(ModelViewSet):
    serializer_class = CartSerializer
    queryset = Cart.objects.prefetch_related('items__product').all()
    #permission_classes = [IsAdminUser]

class CartItemViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'patch', 'delete']
    #permission_classes = [IsAdminUser]

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
        customer = Customer.objects.get_or_create(user_id=user.id)[0]
        return Order.objects.filter(customer_id=customer.id)
    
    def get_serializer_context(self):
        return {'user_id': self.request.user.id}


class OrderItemViewSet(ModelViewSet):
    serializer_class = OrderItemSerializer
    queryset = OrderItem.objects.all()
    #permission_classes = [IsAdminUser]


    ###### SMS ######

@api_view(['POST'])
def send_confirmation_code(request):
    """
    Envoyer un code de vérification par email
    """
    try:
        # Récupérer les données de la requête
        phone = request.data.get('phone')
        email = request.data.get('email')   
        type = request.data.get('type')
        date = request.data.get('date')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        name = request.data.get('name')
        
        # Valider les données
        if not phone or not type:
            return Response(
                {"error": "Numéro de téléphone et type requis"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not email:
            return Response(
                {"error": "Email requis"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not name: 
            return Response(
                {"error": "Nom requis"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"=== DÉBUT ENVOI EMAIL DJANGO ===")
        logger.info(f"Email destinataire: {email}")
        logger.info(f"Type de paiement: {type}")
        logger.info(f"Date: {date}")
        logger.info(f"Heure de début: {start_time}")
        logger.info(f"Heure de fin: {end_time}")
        logger.info(f"Nom: {name}")

        code = random.randint(1000, 9999)
        serializer = EmailConfirmationCodeSerializer(data={'email': email, 'code': code})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        email_context = {
            'email': email,
            'name': name,
            'date': date,
            'start_time': start_time,
            'end_time': end_time,
            'code': code,
        }
        
        logger.info(f"Contexte email préparé pour {type}")
        
        # Générer le contenu HTML et texte
        html_message = render_to_string('emails/code_confirmation.html', email_context)
        plain_message = strip_tags(html_message)
        
        logger.info("Template email généré, envoi en cours...")
        logger.info(f"Configuration email - HOST: {settings.EMAIL_HOST}")
        logger.info(f"Configuration email - PORT: {settings.EMAIL_PORT}")
        logger.info(f"Configuration email - USER: {settings.EMAIL_HOST_USER}")
        logger.info(f"Configuration email - FROM: {settings.DEFAULT_FROM_EMAIL}")
        logger.info(f"Recipients: {[email, settings.DEFAULT_FROM_EMAIL]}")
        
        # Envoyer l'email
        send_mail(
            subject=f"Code de confirmation - Maison Hoolis",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email, settings.DEFAULT_FROM_EMAIL],  # Copie pour vous
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info("Email envoyé avec succès via Django")
        
        return Response(
            {"message": "Code de confirmation envoyé avec succès"}, 
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {"error": f"Erreur lors de l'envoi de l'email de confirmation. {e}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def verify_confirmation_code(request):
    """
    Vérifier le code de confirmation
    """
    try:
        code = request.data.get('code')
        email = request.data.get('email')
        date = request.data.get('date')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        name = request.data.get('name')
        phone = request.data.get('phone')
        product = request.data.get('product')
        type = request.data.get('type')
        print(type)

        confirmation = EmailConfirmationCode.objects.get(email=email, code=code)
        if not confirmation:
            return Response(
                {"error": "Code de confirmation invalide"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        confirmation.verified = True
        confirmation.save()


        slot = SlotsProduct.objects.get(date=date, start_time=start_time, end_time=end_time)
        slot.is_available = False
        slot.save()

        BookingProduct.objects.create(
            date=date,
            start_time=start_time,
            end_time=end_time,
            name=name,
            phone=phone,
            product=product
        )

        email_context = {
            'email': email,
            'name': name,
            'date': date,
            'start_time': start_time,
            'end_time': end_time,
            'code': code,
        }
        
        logger.info(f"Contexte email préparé pour {type}")
        
        # Générer le contenu HTML et texte
        html_message = render_to_string('emails/reservation_confirmation.html', email_context)
        plain_message = strip_tags(html_message)
        
        logger.info("Template email généré, envoi en cours...")
        logger.info(f"Configuration email - HOST: {settings.EMAIL_HOST}")
        logger.info(f"Configuration email - PORT: {settings.EMAIL_PORT}")
        logger.info(f"Configuration email - USER: {settings.EMAIL_HOST_USER}")
        logger.info(f"Configuration email - FROM: {settings.DEFAULT_FROM_EMAIL}")
        logger.info(f"Recipients: {[email, settings.DEFAULT_FROM_EMAIL]}")
        
        # Envoyer l'email
        send_mail(
            subject=f"Confirmation de réservation - Maison Hoolis",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email, settings.DEFAULT_FROM_EMAIL],  # Copie pour vous
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info("Email envoyé avec succès via Django")
        
        return Response(
            {"message": "Confirmation de réservation envoyée avec succès"}, 
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": f"Erreur lors de la vérification du code de confirmation. {e}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def create_stripe_session(request):
    """
    Créer session Stripe pour  cart_id
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
        cart_id = data.get('cart_id')
        
        if not customer_data.get('email'):
            return Response(
                {"error": "Email client requis"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer le customer immédiatement avec has_payed=False
        customer_email = sanitize_text_input(customer_data.get('email', '').strip())
        customer_first_name = sanitize_text_input(customer_data.get('firstName', ''))
        customer_last_name = sanitize_text_input(customer_data.get('lastName', ''))
        customer_name_full = f"{customer_first_name} {customer_last_name}".strip()
        customer_phone = sanitize_text_input(customer_data.get('phone', ''))
        customer_address = sanitize_text_input(customer_data.get('address', ''))
        

        User = get_user_model()
        
        try:
            # Créer ou récupérer l'utilisateur
            user, created = User.objects.get_or_create(
                email=customer_email,
                defaults={'username': customer_email}
            )
            logger.info(f"User {'créé' if created else 'récupéré'}: {user.email}")
            
            # Créer ou récupérer le customer avec has_payed=False par défaut
            customer, customer_created = Customer.objects.get_or_create(
                user=user,
                defaults={
                    'name': customer_name_full[:100],
                    'email': customer_email[:100], 
                    'phone': customer_phone[:50],
                    'address': customer_address[:100],
                    'has_payed': False  # Créé avec has_payed=False
                }
            )
            logger.info(f"Customer {'créé' if customer_created else 'récupéré'}: {customer.name} (has_payed: {customer.has_payed})")
            
        except Exception as user_error:
            logger.error(f"ERREUR création utilisateur/customer: {str(user_error)}")
            return Response(
                {"error": "Erreur création utilisateur"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        if cart_id:
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
            
            success_url = f"{settings.FRONTEND_URL}/hoolis?payment=success&session_id={{CHECKOUT_SESSION_ID}}"
            cancel_url = f"{settings.FRONTEND_URL}/hoolis?payment=cancelled"
            
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
                {"error": "cart_id requis"}, 
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
    logger.info("🚀 === VERIFY_PAYMENT APPELÉE ===")
    logger.info(f"Request data: {request.data}")
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
            
            # Récupérer l'utilisateur existant (il devrait déjà exister depuis create_stripe_session)
            try:
                user = User.objects.get(email=customer_email)
                logger.info(f"Utilisateur récupéré: {user.id}")
            except User.DoesNotExist:
                logger.error(f"ERREUR: Utilisateur non trouvé pour email: {customer_email}")
                return Response({
                    'status': 'error',
                    'message': 'Utilisateur non trouvé'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Récupérer le customer existant et marquer has_payed=True
            try:
                customer = Customer.objects.get(user=user)
                if not customer.has_payed:
                    customer.has_payed = True
                    customer.save()
                    logger.info(f"Customer mis à jour: {customer.name} - has_payed=True")
                else:
                    logger.info(f"Customer déjà payé: {customer.name}")
            except Customer.DoesNotExist:
                logger.error(f"ERREUR: Customer non trouvé pour user: {user.id}")
                return Response({
                    'status': 'error',
                    'message': 'Customer non trouvé'
                }, status=status.HTTP_404_NOT_FOUND)
            

            cart_id = metadata.get('cart_id')
            logger.info(f"Processing cart_purchase for cart_id: {cart_id}")
            
            # Vérifier si le cart existe avant la validation
            from .models import Cart
            cart_exists = Cart.objects.filter(pk=cart_id).exists()
            logger.info(f"Cart exists: {cart_exists}")
            
            serializer = CreateOrderSerializer(
                data={'cart_id': cart_id}, 
                context={'user_id': user.id}
            )
            
            if not serializer.is_valid():
                logger.error(f"Serializer invalide: {serializer.errors}")
                # Si le cart n'existe plus, c'est peut-être déjà traité
                if 'No cart with the given ID was found' in str(serializer.errors):
                    logger.warning(f"Cart {cart_id} already processed, returning success")
                    return Response({
                        'status': 'success',
                        'message': 'Commande déjà traitée'
                    })
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
            
            # Envoi email de confirmation avec Django
            try:
                logger.info(f"=== DÉBUT ENVOI EMAIL DJANGO ===")
                logger.info(f"Email destinataire: {customer_email}")
                logger.info(f"Type de paiement: {payment_type}")
                logger.info(f"Order ID: {order.id}")
                
                # Préparer les données pour le template
                from datetime import datetime
                
                brand_name = "Maison Hoolis"
                
                email_context = {
                    'brand_name': brand_name,
                    'customer_first_name': metadata.get('customer_first_name', ''),
                    'customer_last_name': metadata.get('customer_last_name', ''),
                    'customer_address': metadata.get('customer_address', ''),
                    'customer_city': metadata.get('customer_city', ''),
                    'customer_postal_code': metadata.get('customer_postal_code', ''),
                    'customer_country': metadata.get('customer_country', ''),
                    'order_id': order.id,
                    'order_date': datetime.now().strftime('%d/%m/%Y'),
                    'products': products_details,
                    'total_price': f"{order.total_price}€",
                    'payment_id': session.payment_intent,
                    'year': datetime.now().year,
                }
                
                logger.info(f"Contexte email préparé pour {brand_name}")
                
                # Générer le contenu HTML et texte
                html_message = render_to_string('emails/order_confirmation.html', email_context)
                plain_message = strip_tags(html_message)
                
                logger.info("Template email généré, envoi en cours...")
                logger.info(f"Configuration email - HOST: {settings.EMAIL_HOST}")
                logger.info(f"Configuration email - PORT: {settings.EMAIL_PORT}")
                logger.info(f"Configuration email - USER: {settings.EMAIL_HOST_USER}")
                logger.info(f"Configuration email - FROM: {settings.DEFAULT_FROM_EMAIL}")
                logger.info(f"Recipients: {[customer_email, settings.DEFAULT_FROM_EMAIL]}")
                
                # Envoyer l'email
                send_mail(
                    subject=email_subject,
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[customer_email, settings.DEFAULT_FROM_EMAIL],  # Copie pour vous
                    html_message=html_message,
                    fail_silently=False,
                )
                
                logger.info("Email envoyé avec succès via Django")
                
            except Exception as email_error:
                logger.error(f"Erreur envoi email Django: {str(email_error)}")
                import traceback
                logger.error(f"Traceback complet: {traceback.format_exc()}")
            
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

