#!/usr/bin/env python3
"""
Commande Django pour peupler la base de données Hoolis
Exécute directement du SQL pour insérer les données de démonstration
"""

from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Peuple la base de données avec les données de démonstration Hoolis en SQL'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force la suppression des données existantes',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Début du peuplement de la base de données Hoolis (SQL)...')
        )

        cursor = connection.cursor()

        try:
            if options['force']:
                self.clear_existing_data(cursor)

            # Exécuter les insertions SQL
            self.insert_users(cursor)
            self.insert_collections(cursor)
            self.insert_products(cursor)
            self.insert_product_images(cursor)
            self.insert_watches(cursor)
            self.insert_watch_media(cursor)
            self.insert_product_slots(cursor)
            self.insert_watch_slots(cursor)
            self.insert_product_bookings(cursor)
            self.insert_watch_bookings(cursor)
            self.insert_tags(cursor)
            self.insert_tagged_items(cursor)
            self.update_featured_products(cursor)

            self.show_summary(cursor)
            self.stdout.write(
                self.style.SUCCESS('✅ Base de données peuplée avec succès!')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erreur lors du peuplement: {str(e)}')
            )
            raise
        finally:
            cursor.close()

    def clear_existing_data(self, cursor):
        """Supprime les données existantes"""
        self.stdout.write('🧹 Suppression des données existantes...')
        
        sql_cleanup = [
            "DELETE FROM tags_taggeditem;",
            "DELETE FROM tags_tag;",
            "DELETE FROM store_bookingwatch;",
            "DELETE FROM store_bookingproduct;",
            "DELETE FROM store_slotswatch;",
            "DELETE FROM store_slotsproduct;",
            "DELETE FROM store_watchmedia;",
            "DELETE FROM store_watch;",
            "DELETE FROM store_productimage;",
            "DELETE FROM store_product;",
            "DELETE FROM store_collection;",
            "DELETE FROM core_user WHERE is_superuser = false;",
        ]
        
        for sql in sql_cleanup:
            cursor.execute(sql)

    def insert_users(self, cursor):
        """Insérer les utilisateurs"""
        self.stdout.write('👥 Insertion des utilisateurs...')
        
        sql = """
        INSERT INTO core_user (username, email, first_name, last_name, is_staff, is_active, is_superuser, password, date_joined, last_login)
        VALUES 
        ('admin', 'admin@hoolis.com', 'Admin', 'Hoolis', true, true, true, 'pbkdf2_sha256$600000$salt$hash', NOW(), NOW()),
        ('client1', 'client1@email.com', 'Pierre', 'Dupont', false, true, false, 'pbkdf2_sha256$600000$salt$hash', NOW(), NOW()),
        ('marie', 'marie@email.com', 'Marie', 'Martin', false, true, false, 'pbkdf2_sha256$600000$salt$hash', NOW(), NOW()),
        ('jean', 'jean@email.com', 'Jean', 'Durand', false, true, false, 'pbkdf2_sha256$600000$salt$hash', NOW(), NOW())
        ON CONFLICT (email) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Utilisateurs insérés')

    def insert_collections(self, cursor):
        """Insérer les collections"""
        self.stdout.write('📂 Insertion des collections...')
        
        sql = """
        INSERT INTO store_collection (name, description) VALUES 
        ('VETEMENTS', 'Collection de vêtements tendance et accessoires de mode'),
        ('MAROQUINERIE', 'Sacs, portefeuilles et accessoires en cuir de qualité')
        ON CONFLICT (name) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Collections insérées')

    def insert_products(self, cursor):
        """Insérer les produits"""
        self.stdout.write('🛍️ Insertion des produits...')
        
        sql = """
        INSERT INTO store_product (title, price, description, collection_id, is_available) VALUES 
        ('T-shirt Premium Blanc', 89.00, 'T-shirt en coton biologique, coupe moderne et confortable', 
         (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true),
        ('T-shirt Premium Noir', 89.00, 'T-shirt élégant en coton premium, finitions soignées', 
         (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true),
        ('Pantalon Chino Beige', 129.00, 'Pantalon chino coupe droite, tissu stretch confortable', 
         (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true),
        ('Pantalon Cargo Street', 149.00, 'Pantalon cargo moderne avec poches utilitaires', 
         (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true),
        ('Pantalon Jogger Sport', 119.00, 'Pantalon de sport décontracté, matière technique respirante', 
         (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true),
        ('Pull Over Col Rond', 159.00, 'Pull en laine mérinos, douceur et chaleur exceptionnelles', 
         (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true),
        ('Sweat Capuche Urban', 139.00, 'Sweat à capuche streetwear, coton molletonné épais', 
         (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true),
        ('Portefeuille Cuir Noir', 79.00, 'Portefeuille en cuir véritable, compartiments multiples', 
         (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true),
        ('Sac Bandoulière Vintage', 199.00, 'Sac en cuir vieilli, style vintage authentique', 
         (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true),
        ('Ceinture Cuir Marron', 65.00, 'Ceinture en cuir pleine fleur, boucle métal brossé', 
         (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true),
        ('Porte-cartes Minimaliste', 45.00, 'Porte-cartes compact en cuir, design épuré', 
         (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true)
        ON CONFLICT (title) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Produits insérés')

    def insert_product_images(self, cursor):
        """Insérer les images produits"""
        self.stdout.write('🖼️ Insertion des images produits...')
        
        sql = """
        INSERT INTO store_productimage (product_id, image) VALUES 
        ((SELECT id FROM store_product WHERE title = 'T-shirt Premium Blanc'), 'store/Shop/Articles/top-1-0.jpg'),
        ((SELECT id FROM store_product WHERE title = 'T-shirt Premium Blanc'), 'store/Shop/Articles/top-1-1.jpg'),
        ((SELECT id FROM store_product WHERE title = 'T-shirt Premium Noir'), 'store/Shop/Articles/top-2-0.jpg'),
        ((SELECT id FROM store_product WHERE title = 'T-shirt Premium Noir'), 'store/Shop/Articles/top-2-1.jpg'),
        ((SELECT id FROM store_product WHERE title = 'Pantalon Chino Beige'), 'store/Shop/Articles/pants-1-0.jpg'),
        ((SELECT id FROM store_product WHERE title = 'Pantalon Cargo Street'), 'store/Shop/Articles/pants-2-0.jpg'),
        ((SELECT id FROM store_product WHERE title = 'Pantalon Jogger Sport'), 'store/Shop/Articles/pants-3-0.jpg'),
        ((SELECT id FROM store_product WHERE title = 'Pull Over Col Rond'), 'store/Shop/Articles/top-3-0.jpg'),
        ((SELECT id FROM store_product WHERE title = 'Sweat Capuche Urban'), 'store/Shop/Articles/top-4-0.jpg'),
        ((SELECT id FROM store_product WHERE title = 'Portefeuille Cuir Noir'), 'store/Shop/Articles/acc-1-0.jpg'),
        ((SELECT id FROM store_product WHERE title = 'Sac Bandoulière Vintage'), 'store/Shop/Articles/acc-2-0.jpg'),
        ((SELECT id FROM store_product WHERE title = 'Ceinture Cuir Marron'), 'store/Shop/Articles/acc-3-0.jpg'),
        ((SELECT id FROM store_product WHERE title = 'Porte-cartes Minimaliste'), 'store/Shop/Articles/acc-4-0.jpg')
        ON CONFLICT (product_id, image) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Images produits insérées')

    def insert_watches(self, cursor):
        """Insérer les montres/services"""
        self.stdout.write('⌚ Insertion des services...')
        
        sql = """
        INSERT INTO store_watch (id, name, description) VALUES 
        (1, 'Watch1', 'Une montre élégante et moderne avec un design sophistiqué. Parfaite pour toutes les occasions.'),
        (2, 'Watch2', 'Montre de luxe au style contemporain, alliant performance et esthétique raffinée.'),
        (3, 'Tudor', 'Montre Tudor emblématique, symbole d''excellence horlogère et de tradition suisse.')
        ON CONFLICT (id) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Services insérés')

    def insert_watch_media(self, cursor):
        """Insérer les médias des montres"""
        self.stdout.write('🎬 Insertion des médias services...')
        
        sql = """
        INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
        (1, 'store/F&W/watch1-small-1.png', 'small', 'image'),
        (1, 'store/F&W/watch1-small-2.png', 'small', 'image'),
        (1, 'store/F&W/watch1-small-3.png', 'small', 'image'),
        (1, 'store/F&W/watch1-small-4.webm', 'small', 'video'),
        (1, 'store/F&W/watch1-wide-1.png', 'wide', 'image'),
        (1, 'store/F&W/watch1-wide-2.png', 'wide', 'image'),
        (1, 'store/F&W/watch1-wide-3.png', 'wide', 'image'),
        (1, 'store/F&W/watch1-wide-4.webm', 'wide', 'video'),
        (2, 'store/F&W/watch2-wide-1.png', 'wide', 'image'),
        (2, 'store/F&W/watch2-wide-2.png', 'wide', 'image'),
        (2, 'store/F&W/watch2-wide-3.png', 'wide', 'image'),
        (2, 'store/F&W/watch2-wide-4.webm', 'wide', 'video'),
        (3, 'store/F&W/Tudor_small_1.jpg', 'small', 'image'),
        (3, 'store/F&W/Tudor_small_2.jpg', 'small', 'image'),
        (3, 'store/F&W/Tudor_small_3.jpg', 'small', 'image'),
        (3, 'store/F&W/Tudor_small_4.jpg', 'small', 'image'),
        (3, 'store/F&W/Tudor_small_5.jpg', 'small', 'image')
        ON CONFLICT (watch_id, media) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Médias services insérés')

    def insert_product_slots(self, cursor):
        """Insérer les créneaux produits"""
        self.stdout.write('📅 Insertion des créneaux produits...')
        
        sql = """
        INSERT INTO store_slotsproduct (date, start_time, end_time, is_available) VALUES 
        (CURRENT_DATE, '09:00:00', '10:30:00', true),
        (CURRENT_DATE, '10:30:00', '12:00:00', false),
        (CURRENT_DATE, '14:00:00', '15:30:00', true),
        (CURRENT_DATE, '15:30:00', '17:00:00', true),
        (CURRENT_DATE + 1, '09:00:00', '10:30:00', true),
        (CURRENT_DATE + 1, '10:30:00', '12:00:00', true),
        (CURRENT_DATE + 1, '14:00:00', '15:30:00', false),
        (CURRENT_DATE + 1, '15:30:00', '17:00:00', true),
        (CURRENT_DATE + 2, '09:00:00', '10:30:00', true),
        (CURRENT_DATE + 2, '10:30:00', '12:00:00', true),
        (CURRENT_DATE + 3, '09:00:00', '10:30:00', false),
        (CURRENT_DATE + 3, '14:00:00', '15:30:00', true),
        (CURRENT_DATE + 7, '09:00:00', '10:30:00', true),
        (CURRENT_DATE + 7, '10:30:00', '12:00:00', true),
        (CURRENT_DATE + 7, '14:00:00', '15:30:00', true)
        ON CONFLICT (date, start_time, end_time) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Créneaux produits insérés')

    def insert_watch_slots(self, cursor):
        """Insérer les créneaux montres"""
        self.stdout.write('⌚ Insertion des créneaux services...')
        
        sql = """
        INSERT INTO store_slotswatch (date, start_time, end_time, is_available) VALUES 
        (CURRENT_DATE, '08:00:00', '09:00:00', true),
        (CURRENT_DATE, '09:00:00', '11:00:00', false),
        (CURRENT_DATE, '11:00:00', '13:00:00', true),
        (CURRENT_DATE, '14:00:00', '16:00:00', true),
        (CURRENT_DATE, '16:00:00', '18:00:00', false),
        (CURRENT_DATE + 1, '08:00:00', '10:00:00', true),
        (CURRENT_DATE + 1, '10:00:00', '12:00:00', true),
        (CURRENT_DATE + 1, '14:00:00', '17:00:00', true),
        (CURRENT_DATE + 2, '08:00:00', '11:00:00', false),
        (CURRENT_DATE + 2, '11:00:00', '13:00:00', true),
        (CURRENT_DATE + 3, '08:00:00', '12:00:00', true),
        (CURRENT_DATE + 3, '14:00:00', '18:00:00', true)
        ON CONFLICT (date, start_time, end_time) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Créneaux services insérés')

    def insert_product_bookings(self, cursor):
        """Insérer les réservations produits"""
        self.stdout.write('📝 Insertion des réservations produits...')
        
        sql = """
        INSERT INTO store_bookingproduct (name, product, date, start_time, end_time, created_at, is_canceled) VALUES 
        ('Pierre Dupont', 'Essayage T-shirt', CURRENT_DATE, '10:30:00', '12:00:00', NOW(), false),
        ('Marie Martin', 'Conseil Style', CURRENT_DATE + 1, '14:00:00', '15:30:00', NOW(), false),
        ('Jean Durand', 'Achat Pantalon', CURRENT_DATE + 3, '09:00:00', '10:30:00', NOW(), false),
        ('Sophie Bernard', 'Consultation Maroquinerie', CURRENT_DATE + 7, '10:30:00', '12:00:00', NOW(), false)
        ON CONFLICT (name, date, start_time) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Réservations produits insérées')

    def insert_watch_bookings(self, cursor):
        """Insérer les réservations montres"""
        self.stdout.write('⌚ Insertion des réservations services...')
        
        sql = """
        INSERT INTO store_bookingwatch (name, watch, date, start_time, end_time, created_at, is_canceled) VALUES 
        ('Pierre Dupont', 'Retouche Pantalon', CURRENT_DATE, '09:00:00', '11:00:00', NOW(), false),
        ('Marie Martin', 'Broderie Personnalisée', CURRENT_DATE, '16:00:00', '18:00:00', NOW(), false),
        ('Jean Durand', 'Nettoyage à Sec', CURRENT_DATE + 2, '08:00:00', '11:00:00', NOW(), false),
        ('Sophie Bernard', 'Réparation Sac Cuir', CURRENT_DATE + 3, '14:00:00', '18:00:00', NOW(), false),
        ('Paul Moreau', 'Pressing Express', CURRENT_DATE + 1, '08:00:00', '10:00:00', NOW(), true)
        ON CONFLICT (name, date, start_time) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Réservations services insérées')

    def insert_tags(self, cursor):
        """Insérer les tags"""
        self.stdout.write('🏷️ Insertion des tags...')
        
        sql = """
        INSERT INTO tags_tag (label, description, created_at) VALUES 
        ('Mode', 'Articles de mode et tendance', NOW()),
        ('Coton', 'Matière coton naturel et biologique', NOW()),
        ('Cuir', 'Articles en cuir véritable', NOW()),
        ('Casual', 'Style décontracté et confortable', NOW()),
        ('Premium', 'Qualité premium et finitions soignées', NOW()),
        ('Streetwear', 'Style urbain et moderne', NOW()),
        ('Vintage', 'Style rétro et intemporel', NOW()),
        ('Eco-responsable', 'Matières et production éthiques', NOW())
        ON CONFLICT (label) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Tags insérés')

    def insert_tagged_items(self, cursor):
        """Insérer les objets tagués"""
        self.stdout.write('🔗 Insertion des liens produits-tags...')
        
        sql = """
        INSERT INTO tags_taggeditem (tag_id, content_type_id, object_id, created_at) VALUES 
        ((SELECT id FROM tags_tag WHERE label = 'Mode'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'T-shirt Premium Blanc'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Coton'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'T-shirt Premium Blanc'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Premium'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'T-shirt Premium Blanc'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Mode'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'T-shirt Premium Noir'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Coton'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'T-shirt Premium Noir'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Premium'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'T-shirt Premium Noir'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Casual'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'Pantalon Chino Beige'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Premium'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'Pantalon Chino Beige'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Streetwear'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'Pantalon Cargo Street'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Casual'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'Pantalon Cargo Street'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Cuir'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'Portefeuille Cuir Noir'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Premium'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'Portefeuille Cuir Noir'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Cuir'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'Sac Bandoulière Vintage'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Vintage'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'Sac Bandoulière Vintage'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Cuir'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'Ceinture Cuir Marron'), NOW()),
        ((SELECT id FROM tags_tag WHERE label = 'Casual'), 
         (SELECT id FROM django_content_type WHERE model = 'product'), 
         (SELECT id FROM store_product WHERE title = 'Ceinture Cuir Marron'), NOW())
        ON CONFLICT (tag_id, content_type_id, object_id) DO NOTHING;
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Liens produits-tags insérés')

    def update_featured_products(self, cursor):
        """Mettre à jour les produits vedettes"""
        self.stdout.write('⭐ Mise à jour des produits vedettes...')
        
        sql = """
        UPDATE store_collection SET featured_product_id = (SELECT id FROM store_product WHERE title = 'T-shirt Premium Blanc') WHERE name = 'VETEMENTS';
        UPDATE store_collection SET featured_product_id = (SELECT id FROM store_product WHERE title = 'Portefeuille Cuir Noir') WHERE name = 'MAROQUINERIE';
        """
        cursor.execute(sql)
        self.stdout.write('  ✓ Produits vedettes mis à jour')

    def show_summary(self, cursor):
        """Afficher un résumé des données créées"""
        self.stdout.write('\n📊 RÉSUMÉ DES DONNÉES CRÉÉES:')
        
        tables = [
            ('core_user', '👥 Utilisateurs'),
            ('store_collection', '📂 Collections'),
            ('store_product', '🛍️ Produits'),
            ('store_productimage', '🖼️ Images produits'),
            ('store_watch', '⌚ Services'),
            ('store_watchmedia', '🎬 Médias services'),
            ('store_slotsproduct', '📅 Créneaux produits'),
            ('store_slotswatch', '⌚ Créneaux services'),
            ('store_bookingproduct', '📝 Réservations produits'),
            ('store_bookingwatch', '⌚ Réservations services'),
            ('tags_tag', '🏷️ Tags'),
            ('tags_taggeditem', '🔗 Objets tagués'),
        ]
        
        for table, label in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            self.stdout.write(f'  {label}: {count}') 