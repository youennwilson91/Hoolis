from .models import *
from .serializers import *
from rest_framework.decorators import api_view, throttle_classes, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from rest_framework.permissions import *
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model

from .filters import ProductFilter
from .permissons import IsAdminOrReadOnly
from .utils import SafeErrorHandler, sanitize_text_input
from .tasks import send_order_confirmation_email
from .throttling import PaymentRateThrottle, BurstRateThrottle
from .mixins import CacheControlMixin

# External libraries
import stripe
import logging
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

# Configuration du logger
logger = logging.getLogger(__name__)

class ProductViewSet(CacheControlMixin, ModelViewSet):
    # Cache: 10min navigateur, 1h CDN (via CacheControlMixin)
    cache_max_age = 600
    cache_s_maxage = 3600
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'title']
    pagination_class = PageNumberPagination
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Product.objects.select_related('collection').prefetch_related('images').order_by('-id')
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



class CollectionViewSet(CacheControlMixin, ModelViewSet):
    # Cache: 10min navigateur, 1h CDN (via CacheControlMixin)
    cache_max_age = 600
    cache_s_maxage = 3600
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

class ProductImageViewSet(CacheControlMixin, ModelViewSet):
    # Cache: 10min navigateur, 1h CDN (via CacheControlMixin)
    cache_max_age = 600
    cache_s_maxage = 3600
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        return ProductImage.objects.filter(product_id=self.kwargs['product_pk'])

    def get_serializer_context(self):
        return {'product_id': self.kwargs['product_pk']}

# BOOKING DISABLED
# class SlotsProductViewSet(ModelViewSet):
#     http_method_names = ['get']
#     serializer_class = SlotsProductSerializer
#     permission_classes = [IsAdminOrReadOnly]

#     def get_queryset(self):
#         date_str = self.request.GET.get('date')
#         if not date_str:
#             return Response({"error": "Missing 'date' parameter (YYYY-MM-DD)"}, status=400)
#         try:
#             selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
#         except ValueError:
#             return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
#         return SlotsProduct.objects.filter(is_available=True).filter(date=selected_date)


# class BookingProductViewSet(ModelViewSet):
#     http_method_names = ['post', 'delete', 'head', 'options']
#     queryset = BookingProduct.objects.all()
#     permission_classes = [AllowAny]  # POST ouvert pour les réservations, DELETE géré dans la vue

#     def get_serializer_context(self):
#         return {
#             'date': self.request.data.get('date'),
#             'phone': self.request.data.get('phone'),
#             'product': self.request.data.get('product'),
#             'name': self.request.data.get('name'),
#             'start_time': self.request.data.get('start_time'),
#             'end_time': self.request.data.get('end_time')
#             }

#     def get_serializer_class(self):
#         if self.request.method == 'POST':
#             return CreateBookingProductSerializer
#         elif self.request.method == 'DELETE':
#             return DeleteBookingProductSerializer

#     def create(self, request, *args, **kwargs):
#         try:
#             return super().create(request, *args, **kwargs)
#         except IntegrityError as e:
#             # Vérifier si c'est une erreur de contrainte d'unicité sur le téléphone
#             if 'phone' in str(e).lower():
#                 return Response(
#                     {
#                         'error': 'Ce numéro de téléphone est déjà utilisé.',
#                         'detail': 'Une réservation existe déjà avec ce numéro de téléphone. Veuillez utiliser un autre numéro ou annuler votre réservation existante.'
#                     },
#                     status=status.HTTP_409_CONFLICT
#                 )
#             # Pour les autres erreurs d'intégrité, on relance l'exception
#             raise



class CustomerViewSet(ModelViewSet):
    serializer_class = CustomerSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['name', 'email', 'phone']
    search_fields = ['name', 'email', 'phone', 'address']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Customer.objects.all()
        # Un utilisateur normal ne voit que son propre profil
        return Customer.objects.filter(user=user)




class OrderViewSet(ModelViewSet):
    # POST removed: orders are created via Stripe webhook, not direct API
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.request.method in ['PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
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
    permission_classes = [IsAdminUser]


    # BOOKING DISABLED
    # ###### SMS ######

# @api_view(['POST'])
# def send_confirmation_code(request):
#     """
#     Envoyer un code de vérification par email
#     """
#     try:
#         # Récupérer les données de la requête
#         phone = request.data.get('phone')
#         email = request.data.get('email')
#         type = request.data.get('type')
#         date = request.data.get('date')
#         start_time = request.data.get('start_time')
#         end_time = request.data.get('end_time')
#         name = request.data.get('name')

#         # Valider les données
#         if not phone or not type:
#             return Response(
#                 {"error": "Numéro de téléphone et type requis"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         if not email:
#             return Response(
#                 {"error": "Email requis"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         if not name:
#             return Response(
#                 {"error": "Nom requis"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # Code à 6 chiffres cryptographiquement sécurisé
#         code = secrets.randbelow(900000) + 100000
#         serializer = EmailConfirmationCodeSerializer(data={'email': email, 'code': code})
#         serializer.is_valid(raise_exception=True)
#         serializer.save()

#         email_context = {
#             'email': email,
#             'name': name,
#             'date': date,
#             'start_time': start_time,
#             'end_time': end_time,
#             'code': code,
#         }

#         # Générer le contenu HTML et texte
#         html_message = render_to_string('emails/code_confirmation.html', email_context)
#         plain_message = strip_tags(html_message)

#         # Envoyer l'email
#         send_mail(
#             subject=f"Code de confirmation - Maison Hoolis",
#             message=plain_message,
#             from_email=settings.DEFAULT_FROM_EMAIL,
#             recipient_list=[email, settings.DEFAULT_FROM_EMAIL],  # Copie pour vous
#             html_message=html_message,
#             fail_silently=False,
#         )

#         logger.info("Email envoyé avec succès via Django")

#         return Response(
#             {"message": "Code de confirmation envoyé avec succès"},
#             status=status.HTTP_200_OK
#         )

#     except Exception as e:
#         return Response(
#             {"error": f"Erreur lors de l'envoi de l'email de confirmation. {e}"},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


# @api_view(['POST'])
# def verify_confirmation_code(request):
#     """
#     Vérifier le code de confirmation
#     """
#     try:
#         code = request.data.get('code')
#         email = request.data.get('email')
#         date = request.data.get('date')
#         start_time = request.data.get('start_time')
#         end_time = request.data.get('end_time')
#         name = request.data.get('name')
#         phone = request.data.get('phone')
#         product = request.data.get('product')
#         type = request.data.get('type')

#         try:
#             confirmation = EmailConfirmationCode.objects.get(email=email, code=code)
#         except EmailConfirmationCode.DoesNotExist:
#             return Response(
#                 {"error": "Code de confirmation invalide"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         if confirmation.is_expired():
#             return Response(
#                 {"error": "Code expiré, veuillez en demander un nouveau"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         confirmation.verified = True
#         confirmation.save()

#         try:
#             slot = SlotsProduct.objects.get(date=date, start_time=start_time, end_time=end_time)
#         except SlotsProduct.DoesNotExist:
#             return Response(
#                 {"error": "Créneau non trouvé"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         slot.is_available = False
#         slot.save()

#         BookingProduct.objects.create(
#             date=date,
#             start_time=start_time,
#             end_time=end_time,
#             name=name,
#             phone=phone,
#             product=product
#         )

#         email_context = {
#             'email': email,
#             'name': name,
#             'date': date,
#             'start_time': start_time,
#             'end_time': end_time,
#             'code': code,
#         }

#         # Générer le contenu HTML et texte
#         html_message = render_to_string('emails/reservation_confirmation.html', email_context)
#         plain_message = strip_tags(html_message)

#         # Envoyer l'email
#         send_mail(
#             subject="Confirmation de réservation - Maison Hoolis",
#             message=plain_message,
#             from_email=settings.DEFAULT_FROM_EMAIL,
#             recipient_list=[email, settings.DEFAULT_FROM_EMAIL],
#             html_message=html_message,
#             fail_silently=False,
#         )

#         logger.info("Email de confirmation envoyé")

#         return Response(
#             {"message": "Confirmation de réservation envoyée avec succès"},
#             status=status.HTTP_200_OK
#         )

#     except Exception as e:
#         logger.error(f"Erreur vérification code: {str(e)}")
#         return Response(
#             {"error": "Erreur lors de la vérification du code de confirmation"},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([PaymentRateThrottle, BurstRateThrottle])
def create_stripe_session(request):
    """
    Créer session Stripe à partir d'une liste d'items directe
    Rate limited: 10 requests/hour per IP + 20 requests/minute burst protection
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
        items = data.get('items', [])

        if not customer_data.get('email'):
            return Response(
                {"error": "Email client requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not items:
            return Response(
                {"error": "Panier vide"},
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
            # Créer ou récupérer le customer avec has_payed=False par défaut
            customer, customer_created = Customer.objects.get_or_create(
                user=user,
                defaults={
                    'name': customer_name_full[:100],
                    'email': customer_email[:100],
                    'phone': customer_phone[:50],
                    'address': customer_address[:100],
                    'has_payed': False
                }
            )

        except Exception as user_error:
            logger.error(f"Erreur création utilisateur/customer: {type(user_error).__name__} - {user_error}")
            return Response(
                {"error": "Erreur création utilisateur"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Construire les line_items à partir de la liste d'items
        line_items = []
        total_amount = 0
        product_ids = []

        for item_data in items:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity', 1)

            if not product_id or quantity <= 0:
                return Response(
                    {"error": "Données item invalides"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                # Récupérer le produit et vérifier qu'il est disponible
                product = Product.objects.get(id=product_id, is_available=True)
            except Product.DoesNotExist:
                return Response(
                    {"error": f"Produit {product_id} non disponible"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            item_total = int(product.price * quantity * 100)
            total_amount += item_total
            product_ids.append(str(product_id))

            line_items.append({
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': sanitize_text_input(product.title),
                        'description': sanitize_text_input(product.description[:100]),
                        'metadata': {
                            'product_id': str(product_id),
                        }
                    },
                    'unit_amount': int(product.price * 100),
                },
                'quantity': quantity,
            })

        if total_amount <= 0:
            return Response(
                {"error": "Montant invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )

        success_url = f"{settings.FRONTEND_URL}/?payment=success&session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{settings.FRONTEND_URL}/?payment=cancelled"

        metadata = {
            'type': 'cart_purchase',
            'product_ids': ','.join(product_ids),
            'customer_first_name': sanitize_text_input(customer_data.get('firstName', '')),
            'customer_last_name': sanitize_text_input(customer_data.get('lastName', '')),
            'customer_phone': sanitize_text_input(customer_data.get('phone', '')),
            'customer_address': sanitize_text_input(customer_data.get('address', '')),
            'customer_city': sanitize_text_input(customer_data.get('city', '')),
            'customer_postal_code': sanitize_text_input(customer_data.get('postalCode', '')),
            'customer_country': sanitize_text_input(customer_data.get('country', '')),
            'total_items': str(len(items)),
        }
        
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


def _create_order_from_stripe_session(session, session_id):
    """
    Fonction helper : créer Order + OrderItems depuis une session Stripe
    Utilisée par le webhook ET verify_payment

    Returns:
        tuple: (order, error_message)
        - Si succès : (order, None)
        - Si erreur : (None, error_message)
    """
    from django.db import transaction
    from datetime import datetime

    stripe.api_key = settings.STRIPE_SECRET_KEY

    # Vérifier idempotence
    existing_order = Order.objects.filter(stripe_session_id=session_id).first()
    if existing_order:
        logger.warning(f"Commande déjà traitée pour session {session_id}")
        return (existing_order, None)

    # Récupérer métadonnées
    metadata = session.metadata
    customer_email = session.customer_email

    # Récupérer User et Customer
    User = get_user_model()
    try:
        user = User.objects.get(email=customer_email)
    except User.DoesNotExist:
        logger.error(f"Utilisateur non trouvé: {customer_email}")
        return (None, "Utilisateur non trouvé")

    try:
        customer = Customer.objects.get(user=user)
        if not customer.has_payed:
            customer.has_payed = True
            customer.save()
    except Customer.DoesNotExist:
        logger.error(f"Customer non trouvé pour user: {user.id}")
        return (None, "Customer non trouvé")

    # Créer la commande avec transaction atomique
    try:
        with transaction.atomic():
            # Créer l'Order
            order = Order.objects.create(
                customer=customer,
                stripe_session_id=session_id,
                payment_status=Order.PAYMENT_COMPLETED,
                total_price=session.amount_total / 100
            )

            # Récupérer les line_items depuis Stripe
            line_items = stripe.checkout.Session.list_line_items(
                session_id,
                limit=100,
                expand=['data.price.product']
            )

            for line_item in line_items.data:
                quantity = line_item.quantity

                # Récupérer le product_id depuis les metadata
                product_metadata = line_item.price.product.metadata if hasattr(line_item.price, 'product') else {}
                product_id = product_metadata.get('product_id')

                if not product_id:
                    logger.error(f"product_id manquant dans metadata du line_item")
                    continue

                try:
                    product = Product.objects.get(id=product_id)
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity
                    )
                except Product.DoesNotExist:
                    logger.error(f"Produit non trouvé: {product_id}")
                    continue

        # Envoyer email de confirmation en arrière-plan (threading simple)
        try:
            from datetime import datetime
            order_items = order.order_items.select_related('product').all()

            # Préparer le contexte de l'email (compatible avec template existant)
            email_context = {
                'brand_name': 'Maison Hoolis',
                'customer_first_name': metadata.get('customer_first_name', ''),
                'customer_last_name': metadata.get('customer_last_name', ''),
                'order_id': order.id,
                'order_date': order.created_at.strftime('%d/%m/%Y'),
                'total_price': f"{order.total_price}€",
                'products': [f"{item.quantity}x {item.product.title}" for item in order_items],
                'customer_address': metadata.get('customer_address', ''),
                'customer_city': metadata.get('customer_city', ''),
                'customer_postal_code': metadata.get('customer_postal_code', ''),
                'customer_country': metadata.get('customer_country', ''),
                'payment_id': session_id,
                'year': datetime.now().year,
            }

            # Générer le contenu HTML et texte
            html_message = render_to_string('emails/order_confirmation.html', email_context)
            plain_message = strip_tags(html_message)

            import threading
            threading.Thread(
                target=send_order_confirmation_email,
                kwargs={
                    'subject': f"Confirmation de commande #{order.id} - Maison Hoolis",
                    'message': plain_message,
                    'from_email': settings.DEFAULT_FROM_EMAIL,
                    'recipient_list': [customer.email, settings.DEFAULT_FROM_EMAIL],
                    'html_message': html_message,
                },
                daemon=True,
            ).start()

            logger.info(f"Commande #{order.id} créée - Email en cours d'envoi")

        except Exception as email_error:
            # Ne pas bloquer la création de commande si email échoue
            logger.error(f"Erreur préparation email (non bloquante): {str(email_error)}")

        return (order, None)

    except Exception as e:
        logger.error(f"Erreur création commande: {type(e).__name__} - {str(e)}")
        return (None, f"Erreur création commande: {str(e)}")


@csrf_exempt
def stripe_webhook(request):
    """
    Webhook Stripe : reçoit les événements de paiement directement de Stripe
    Vue Django pure (pas DRF) pour éviter les conflits CSRF/auth
    Sécurité : vérification de signature Stripe
    """
    if request.method != 'POST':
        return HttpResponse(status=405)

    logger.info("=== STRIPE WEBHOOK APPELÉ ===")

    # Récupérer la signature et le payload
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    if not webhook_secret:
        logger.error("STRIPE_WEBHOOK_SECRET non configuré")
        return HttpResponse('Configuration webhook manquante', status=500)

    # Vérifier la signature
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        logger.error(f"Payload invalide: {str(e)}")
        return HttpResponse('Invalid payload', status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Signature invalide: {str(e)}")
        return HttpResponse('Invalid signature', status=400)

    # Traiter l'événement
    event_type = event['type']
    logger.info(f"Événement reçu: {event_type}")

    if event_type == 'checkout.session.completed':
        session = event['data']['object']
        session_id = session['id']
        payment_status = session.get('payment_status')

        logger.info(f"Session {session_id} - payment_status: {payment_status}")

        if payment_status == 'paid':
            # Créer la commande
            order, error = _create_order_from_stripe_session(session, session_id)

            if error:
                logger.error(f"Erreur webhook création commande: {error}")
                # Retourner 500 pour que Stripe retry
                return HttpResponse(error, status=500)

            logger.info(f"Commande #{order.id} créée via webhook")
            return HttpResponse('success', status=200)
        else:
            logger.warning(f"Session {session_id} completed mais payment_status={payment_status}")
            return HttpResponse('ignored', status=200)

    elif event_type == 'checkout.session.expired':
        session = event['data']['object']
        session_id = session['id']
        logger.info(f"Session {session_id} expirée sans paiement")
        return HttpResponse('logged', status=200)

    else:
        logger.info(f"Événement non géré: {event_type}")
        return HttpResponse('ignored', status=200)


@api_view(['GET'])
def test_ip(request):
    logger.info(f"REMOTE_ADDR: {request.META.get('REMOTE_ADDR')}")
    logger.info(f"HTTP_X_FORWARDED_FOR: {request.META.get('HTTP_X_FORWARDED_FOR')}")
    return Response({'ok': True, 'REMOTE_ADDR': request.META.get('REMOTE_ADDR'), 'HTTP_X_FORWARDED_FOR': request.META.get('HTTP_X_FORWARDED_FOR')})