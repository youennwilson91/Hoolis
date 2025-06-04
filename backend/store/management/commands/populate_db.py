#!/usr/bin/env python3
"""
Commande Django pour peupler la base de données Hoolis
Convertit les données du fichier insert.sql en opérations Django ORM
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal

# Import des modèles
from core.models import User
from store.models import (
    Collection, Product, ProductImage, Watch, WatchMedia,
    SlotsProduct, SlotsWatch, BookingProduct, BookingWatch
)
from tags.models import Tag, TaggedItem


class Command(BaseCommand):
    help = 'Peuple la base de données avec les données de démonstration Hoolis'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force la suppression des données existantes',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Début du peuplement de la base de données Hoolis...')
        )

        if options['force']:
            self.clear_existing_data()

        try:
            # 1. Créer les utilisateurs
            self.create_users()
            
            # 2. Créer les collections
            self.create_collections()
            
            # 3. Créer les produits
            self.create_products()
            
            # 4. Créer les images produits
            self.create_product_images()
            
            # 5. Créer les montres/services
            self.create_watches()
            
            # 6. Créer les médias montres
            self.create_watch_media()
            
            # 7. Créer les créneaux produits
            self.create_product_slots()
            
            # 8. Créer les créneaux montres
            self.create_watch_slots()
            
            # 9. Créer les réservations produits
            self.create_product_bookings()
            
            # 10. Créer les réservations montres
            self.create_watch_bookings()
            
            # 11. Créer les tags
            self.create_tags()
            
            # 12. Créer les objets tagués
            self.create_tagged_items()
            
            # 13. Mettre à jour les produits vedettes
            self.update_featured_products()

            self.show_summary()
            self.stdout.write(
                self.style.SUCCESS('✅ Base de données peuplée avec succès!')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erreur lors du peuplement: {str(e)}')
            )
            raise

    def clear_existing_data(self):
        """Supprime les données existantes si --force est utilisé"""
        self.stdout.write('🧹 Suppression des données existantes...')
        
        # Supprimer dans l'ordre inverse des dépendances
        TaggedItem.objects.all().delete()
        Tag.objects.all().delete()
        BookingWatch.objects.all().delete()
        BookingProduct.objects.all().delete()
        SlotsWatch.objects.all().delete()
        SlotsProduct.objects.all().delete()
        WatchMedia.objects.all().delete()
        Watch.objects.all().delete()
        ProductImage.objects.all().delete()
        Product.objects.all().delete()
        Collection.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()  # Garder le superuser

    def create_users(self):
        """Créer les utilisateurs de démonstration"""
        self.stdout.write('👥 Création des utilisateurs...')
        
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@hoolis.com',
                'first_name': 'Admin',
                'last_name': 'Hoolis',
                'is_staff': True,
                'is_superuser': True,
            },
            {
                'username': 'client1',
                'email': 'client1@email.com',
                'first_name': 'Pierre',
                'last_name': 'Dupont',
            },
            {
                'username': 'marie',
                'email': 'marie@email.com',
                'first_name': 'Marie',
                'last_name': 'Martin',
            },
            {
                'username': 'jean',
                'email': 'jean@email.com',
                'first_name': 'Jean',
                'last_name': 'Durand',
            },
        ]

        for user_data in users_data:
            if not User.objects.filter(email=user_data['email']).exists():
                user = User.objects.create_user(
                    username=user_data['username'],
                    email=user_data['email'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    is_staff=user_data.get('is_staff', False),
                    is_superuser=user_data.get('is_superuser', False),
                    password='hoolis2025!'  # Mot de passe par défaut
                )
                self.stdout.write(f'  ✓ Utilisateur créé: {user.email}')

    def create_collections(self):
        """Créer les collections"""
        self.stdout.write('📂 Création des collections...')
        
        collections_data = [
            {
                'name': 'VETEMENTS',
                'description': 'Collection de vêtements tendance et accessoires de mode'
            },
            {
                'name': 'MAROQUINERIE',
                'description': 'Sacs, portefeuilles et accessoires en cuir de qualité'
            },
        ]

        for collection_data in collections_data:
            collection, created = Collection.objects.get_or_create(
                name=collection_data['name'],
                defaults={'description': collection_data['description']}
            )
            if created:
                self.stdout.write(f'  ✓ Collection créée: {collection.name}')

    def create_products(self):
        """Créer les produits"""
        self.stdout.write('🛍️ Création des produits...')
        
        # Récupérer les collections
        vetements = Collection.objects.get(name='VETEMENTS')
        maroquinerie = Collection.objects.get(name='MAROQUINERIE')
        
        products_data = [
            # Vêtements
            ('T-shirt Premium Blanc', Decimal('89.00'), 'T-shirt en coton biologique, coupe moderne et confortable', vetements),
            ('T-shirt Premium Noir', Decimal('89.00'), 'T-shirt élégant en coton premium, finitions soignées', vetements),
            ('Pantalon Chino Beige', Decimal('129.00'), 'Pantalon chino coupe droite, tissu stretch confortable', vetements),
            ('Pantalon Cargo Street', Decimal('149.00'), 'Pantalon cargo moderne avec poches utilitaires', vetements),
            ('Pantalon Jogger Sport', Decimal('119.00'), 'Pantalon de sport décontracté, matière technique respirante', vetements),
            ('Pull Over Col Rond', Decimal('159.00'), 'Pull en laine mérinos, douceur et chaleur exceptionnelles', vetements),
            ('Sweat Capuche Urban', Decimal('139.00'), 'Sweat à capuche streetwear, coton molletonné épais', vetements),
            
            # Maroquinerie
            ('Portefeuille Cuir Noir', Decimal('79.00'), 'Portefeuille en cuir véritable, compartiments multiples', maroquinerie),
            ('Sac Bandoulière Vintage', Decimal('199.00'), 'Sac en cuir vieilli, style vintage authentique', maroquinerie),
            ('Ceinture Cuir Marron', Decimal('65.00'), 'Ceinture en cuir pleine fleur, boucle métal brossé', maroquinerie),
            ('Porte-cartes Minimaliste', Decimal('45.00'), 'Porte-cartes compact en cuir, design épuré', maroquinerie),
        ]

        for title, price, description, collection in products_data:
            product, created = Product.objects.get_or_create(
                title=title,
                defaults={
                    'price': price,
                    'description': description,
                    'collection': collection,
                    'is_available': True
                }
            )
            if created:
                self.stdout.write(f'  ✓ Produit créé: {product.title}')

    def create_product_images(self):
        """Créer les images produits"""
        self.stdout.write('🖼️ Création des images produits...')
        
        # Mapping produit -> images
        images_data = [
            ('T-shirt Premium Blanc', ['store/Shop/Articles/top-1-0.jpg', 'store/Shop/Articles/top-1-1.jpg']),
            ('T-shirt Premium Noir', ['store/Shop/Articles/top-2-0.jpg', 'store/Shop/Articles/top-2-1.jpg']),
            ('Pantalon Chino Beige', ['store/Shop/Articles/pants-1-0.jpg']),
            ('Pantalon Cargo Street', ['store/Shop/Articles/pants-2-0.jpg']),
            ('Pantalon Jogger Sport', ['store/Shop/Articles/pants-3-0.jpg']),
            ('Pull Over Col Rond', ['store/Shop/Articles/top-3-0.jpg']),
            ('Sweat Capuche Urban', ['store/Shop/Articles/top-4-0.jpg']),
            ('Portefeuille Cuir Noir', ['store/Shop/Articles/acc-1-0.jpg']),
            ('Sac Bandoulière Vintage', ['store/Shop/Articles/acc-2-0.jpg']),
            ('Ceinture Cuir Marron', ['store/Shop/Articles/acc-3-0.jpg']),
            ('Porte-cartes Minimaliste', ['store/Shop/Articles/acc-4-0.jpg']),
        ]

        for product_title, image_paths in images_data:
            try:
                product = Product.objects.get(title=product_title)
                for image_path in image_paths:
                    product_image, created = ProductImage.objects.get_or_create(
                        product=product,
                        image=image_path
                    )
                    if created:
                        self.stdout.write(f'  ✓ Image créée pour {product_title}')
            except Product.DoesNotExist:
                self.stdout.write(f'  ⚠️ Produit non trouvé: {product_title}')

    def create_watches(self):
        """Créer les montres/services"""
        self.stdout.write('⌚ Création des services...')
        
        watches_data = [
            (1, 'Watch1', 'Une montre élégante et moderne avec un design sophistiqué. Parfaite pour toutes les occasions.'),
            (2, 'Watch2', 'Montre de luxe au style contemporain, alliant performance et esthétique raffinée.'),
            (3, 'Tudor', 'Montre Tudor emblématique, symbole d\'excellence horlogère et de tradition suisse.'),
        ]

        for watch_id, name, description in watches_data:
            watch, created = Watch.objects.get_or_create(
                id=watch_id,
                defaults={
                    'name': name,
                    'description': description
                }
            )
            if created:
                self.stdout.write(f'  ✓ Service créé: {watch.name}')

    def create_watch_media(self):
        """Créer les médias des montres"""
        self.stdout.write('🎬 Création des médias services...')
        
        # Watch1 - Small
        watch1_small = [
            ('store/F&W/watch1-small-1.png', 'image'),
            ('store/F&W/watch1-small-2.png', 'image'),
            ('store/F&W/watch1-small-3.png', 'image'),
            ('store/F&W/watch1-small-4.webm', 'video'),
        ]
        
        # Watch1 - Wide
        watch1_wide = [
            ('store/F&W/watch1-wide-1.png', 'image'),
            ('store/F&W/watch1-wide-2.png', 'image'),
            ('store/F&W/watch1-wide-3.png', 'image'),
            ('store/F&W/watch1-wide-4.webm', 'video'),
        ]
        
        # Watch2 - Wide
        watch2_wide = [
            ('store/F&W/watch2-wide-1.png', 'image'),
            ('store/F&W/watch2-wide-2.png', 'image'),
            ('store/F&W/watch2-wide-3.png', 'image'),
            ('store/F&W/watch2-wide-4.webm', 'video'),
        ]
        
        # Tudor - Small
        tudor_small = [
            ('store/F&W/Tudor_small_1.jpg', 'image'),
            ('store/F&W/Tudor_small_2.jpg', 'image'),
            ('store/F&W/Tudor_small_3.jpg', 'image'),
            ('store/F&W/Tudor_small_4.jpg', 'image'),
            ('store/F&W/Tudor_small_5.jpg', 'image'),
        ]

        # Créer les médias
        media_sets = [
            (1, 'small', watch1_small),
            (1, 'wide', watch1_wide),
            (2, 'wide', watch2_wide),
            (3, 'small', tudor_small),
        ]

        for watch_id, size, media_list in media_sets:
            try:
                watch = Watch.objects.get(id=watch_id)
                for media_path, media_type in media_list:
                    watch_media, created = WatchMedia.objects.get_or_create(
                        watch=watch,
                        media=media_path,
                        size=size,
                        type=media_type
                    )
                    if created:
                        self.stdout.write(f'  ✓ Média créé pour {watch.name}')
            except Watch.DoesNotExist:
                self.stdout.write(f'  ⚠️ Service non trouvé: ID {watch_id}')

    def create_product_slots(self):
        """Créer les créneaux produits"""
        self.stdout.write('📅 Création des créneaux produits...')
        
        today = timezone.now().date()
        
        slots_data = [
            (today, '09:00:00', '10:30:00', True),
            (today, '10:30:00', '12:00:00', False),
            (today, '14:00:00', '15:30:00', True),
            (today, '15:30:00', '17:00:00', True),
            (today + timedelta(days=1), '09:00:00', '10:30:00', True),
            (today + timedelta(days=1), '10:30:00', '12:00:00', True),
            (today + timedelta(days=1), '14:00:00', '15:30:00', False),
            (today + timedelta(days=1), '15:30:00', '17:00:00', True),
            (today + timedelta(days=2), '09:00:00', '10:30:00', True),
            (today + timedelta(days=2), '10:30:00', '12:00:00', True),
            (today + timedelta(days=3), '09:00:00', '10:30:00', False),
            (today + timedelta(days=3), '14:00:00', '15:30:00', True),
            (today + timedelta(days=7), '09:00:00', '10:30:00', True),
            (today + timedelta(days=7), '10:30:00', '12:00:00', True),
            (today + timedelta(days=7), '14:00:00', '15:30:00', True),
        ]

        for date, start_time, end_time, is_available in slots_data:
            slot, created = SlotsProduct.objects.get_or_create(
                date=date,
                start_time=start_time,
                end_time=end_time,
                defaults={'is_available': is_available}
            )
            if created:
                self.stdout.write(f'  ✓ Créneau produit créé: {date} {start_time}-{end_time}')

    def create_watch_slots(self):
        """Créer les créneaux montres"""
        self.stdout.write('⌚ Création des créneaux services...')
        
        today = timezone.now().date()
        
        slots_data = [
            (today, '08:00:00', '09:00:00', True),
            (today, '09:00:00', '11:00:00', False),
            (today, '11:00:00', '13:00:00', True),
            (today, '14:00:00', '16:00:00', True),
            (today, '16:00:00', '18:00:00', False),
            (today + timedelta(days=1), '08:00:00', '10:00:00', True),
            (today + timedelta(days=1), '10:00:00', '12:00:00', True),
            (today + timedelta(days=1), '14:00:00', '17:00:00', True),
            (today + timedelta(days=2), '08:00:00', '11:00:00', False),
            (today + timedelta(days=2), '11:00:00', '13:00:00', True),
            (today + timedelta(days=3), '08:00:00', '12:00:00', True),
            (today + timedelta(days=3), '14:00:00', '18:00:00', True),
        ]

        for date, start_time, end_time, is_available in slots_data:
            slot, created = SlotsWatch.objects.get_or_create(
                date=date,
                start_time=start_time,
                end_time=end_time,
                defaults={'is_available': is_available}
            )
            if created:
                self.stdout.write(f'  ✓ Créneau service créé: {date} {start_time}-{end_time}')

    def create_product_bookings(self):
        """Créer les réservations produits"""
        self.stdout.write('📝 Création des réservations produits...')
        
        today = timezone.now().date()
        
        bookings_data = [
            ('Pierre Dupont', 'Essayage T-shirt', today, '10:30:00', '12:00:00', False),
            ('Marie Martin', 'Conseil Style', today + timedelta(days=1), '14:00:00', '15:30:00', False),
            ('Jean Durand', 'Achat Pantalon', today + timedelta(days=3), '09:00:00', '10:30:00', False),
            ('Sophie Bernard', 'Consultation Maroquinerie', today + timedelta(days=7), '10:30:00', '12:00:00', False),
        ]

        for name, product, date, start_time, end_time, is_canceled in bookings_data:
            booking, created = BookingProduct.objects.get_or_create(
                name=name,
                product=product,
                date=date,
                start_time=start_time,
                end_time=end_time,
                defaults={
                    'is_canceled': is_canceled,
                    'created_at': timezone.now()
                }
            )
            if created:
                self.stdout.write(f'  ✓ Réservation produit créée: {name} - {product}')

    def create_watch_bookings(self):
        """Créer les réservations montres"""
        self.stdout.write('⌚ Création des réservations services...')
        
        today = timezone.now().date()
        
        bookings_data = [
            ('Pierre Dupont', 'Retouche Pantalon', today, '09:00:00', '11:00:00', False),
            ('Marie Martin', 'Broderie Personnalisée', today, '16:00:00', '18:00:00', False),
            ('Jean Durand', 'Nettoyage à Sec', today + timedelta(days=2), '08:00:00', '11:00:00', False),
            ('Sophie Bernard', 'Réparation Sac Cuir', today + timedelta(days=3), '14:00:00', '18:00:00', False),
            ('Paul Moreau', 'Pressing Express', today + timedelta(days=1), '08:00:00', '10:00:00', True),
        ]

        for name, watch, date, start_time, end_time, is_canceled in bookings_data:
            booking, created = BookingWatch.objects.get_or_create(
                name=name,
                watch=watch,
                date=date,
                start_time=start_time,
                end_time=end_time,
                defaults={
                    'is_canceled': is_canceled,
                    'created_at': timezone.now()
                }
            )
            if created:
                self.stdout.write(f'  ✓ Réservation service créée: {name} - {watch}')

    def create_tags(self):
        """Créer les tags"""
        self.stdout.write('🏷️ Création des tags...')
        
        tags_data = [
            ('Mode', 'Articles de mode et tendance'),
            ('Coton', 'Matière coton naturel et biologique'),
            ('Cuir', 'Articles en cuir véritable'),
            ('Casual', 'Style décontracté et confortable'),
            ('Premium', 'Qualité premium et finitions soignées'),
            ('Streetwear', 'Style urbain et moderne'),
            ('Vintage', 'Style rétro et intemporel'),
            ('Eco-responsable', 'Matières et production éthiques'),
        ]

        for label, description in tags_data:
            tag, created = Tag.objects.get_or_create(
                label=label,
                defaults={
                    'description': description,
                    'created_at': timezone.now()
                }
            )
            if created:
                self.stdout.write(f'  ✓ Tag créé: {tag.label}')

    def create_tagged_items(self):
        """Créer les objets tagués"""
        self.stdout.write('🔗 Création des liens produits-tags...')
        
        # Récupérer les content types
        product_ct = ContentType.objects.get_for_model(Product)
        
        # Récupérer les tags
        tags = {tag.label: tag for tag in Tag.objects.all()}
        
        # Tags pour produits
        tag_assignments = [
            ('T-shirt Premium Blanc', ['Mode', 'Coton', 'Premium']),
            ('T-shirt Premium Noir', ['Mode', 'Coton', 'Premium']),
            ('Pantalon Chino Beige', ['Casual', 'Premium']),
            ('Pantalon Cargo Street', ['Streetwear', 'Casual']),
            ('Portefeuille Cuir Noir', ['Cuir', 'Premium']),
            ('Sac Bandoulière Vintage', ['Cuir', 'Vintage']),
            ('Ceinture Cuir Marron', ['Cuir', 'Casual']),
        ]

        for product_title, tag_labels in tag_assignments:
            try:
                product = Product.objects.get(title=product_title)
                for tag_label in tag_labels:
                    tag = tags.get(tag_label)
                    if tag:
                        tagged_item, created = TaggedItem.objects.get_or_create(
                            tag=tag,
                            content_type=product_ct,
                            object_id=product.id,
                            defaults={'created_at': timezone.now()}
                        )
                        if created:
                            self.stdout.write(f'  ✓ Tag {tag_label} ajouté à {product_title}')
            except Product.DoesNotExist:
                self.stdout.write(f'  ⚠️ Produit non trouvé: {product_title}')

    def update_featured_products(self):
        """Mettre à jour les produits vedettes des collections"""
        self.stdout.write('⭐ Mise à jour des produits vedettes...')
        
        try:
            # T-shirt pour VETEMENTS
            vetements = Collection.objects.get(name='VETEMENTS')
            tshirt = Product.objects.get(title='T-shirt Premium Blanc')
            vetements.featured_product = tshirt
            vetements.save()
            self.stdout.write(f'  ✓ Produit vedette VETEMENTS: {tshirt.title}')
            
            # Portefeuille pour MAROQUINERIE
            maroquinerie = Collection.objects.get(name='MAROQUINERIE')
            portefeuille = Product.objects.get(title='Portefeuille Cuir Noir')
            maroquinerie.featured_product = portefeuille
            maroquinerie.save()
            self.stdout.write(f'  ✓ Produit vedette MAROQUINERIE: {portefeuille.title}')
            
        except (Collection.DoesNotExist, Product.DoesNotExist) as e:
            self.stdout.write(f'  ⚠️ Erreur mise à jour produits vedettes: {str(e)}')

    def show_summary(self):
        """Afficher un résumé des données créées"""
        self.stdout.write('\n📊 RÉSUMÉ DES DONNÉES CRÉÉES:')
        self.stdout.write(f'  👥 Utilisateurs: {User.objects.count()}')
        self.stdout.write(f'  📂 Collections: {Collection.objects.count()}')
        self.stdout.write(f'  🛍️ Produits: {Product.objects.count()}')
        self.stdout.write(f'  🖼️ Images produits: {ProductImage.objects.count()}')
        self.stdout.write(f'  ⌚ Services: {Watch.objects.count()}')
        self.stdout.write(f'  🎬 Médias services: {WatchMedia.objects.count()}')
        self.stdout.write(f'  📅 Créneaux produits: {SlotsProduct.objects.count()}')
        self.stdout.write(f'  ⌚ Créneaux services: {SlotsWatch.objects.count()}')
        self.stdout.write(f'  📝 Réservations produits: {BookingProduct.objects.count()}')
        self.stdout.write(f'  ⌚ Réservations services: {BookingWatch.objects.count()}')
        self.stdout.write(f'  🏷️ Tags: {Tag.objects.count()}')
        self.stdout.write(f'  🔗 Objets tagués: {TaggedItem.objects.count()}') 