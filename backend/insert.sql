-- Script SQL pour peupler la base de données Hoolis
-- Compatible avec les modèles Django

-- Désactiver les vérifications de clés étrangères temporairement
SET session_replication_role = replica;

-- 1. Utilisateurs (core_user)
INSERT INTO core_user (
    username, email, first_name, last_name, is_staff, is_active, is_superuser,
    password, date_joined, last_login
) VALUES 
('admin', 'admin@hoolis.com', 'Admin', 'Hoolis', true, true, true,
 'pbkdf2_sha256$600000$test$hashpassword', NOW(), NOW()),
('client1', 'client1@email.com', 'Pierre', 'Dupont', false, true, false,
 'pbkdf2_sha256$600000$test$hashpassword', NOW(), NOW()),
('client2', 'marie@email.com', 'Marie', 'Martin', false, true, false,
 'pbkdf2_sha256$600000$test$hashpassword', NOW(), NOW()),
('client3', 'jean@email.com', 'Jean', 'Durand', false, true, false,
 'pbkdf2_sha256$600000$test$hashpassword', NOW(), NOW());

-- 2. Collections (store_collection)
INSERT INTO store_collection (name, description) VALUES 
('VETEMENTS', 'Collection de vêtements tendance et accessoires de mode'),
('MAROQUINERIE', 'Sacs, portefeuilles et accessoires en cuir de qualité');

-- 3. Produits (store_product)
INSERT INTO store_product (title, price, description, collection_id, is_available) VALUES 
-- VETEMENTS
('T-shirt Premium Blanc', 89.00, 'T-shirt en coton biologique, coupe moderne et confortable', 1, true),
('T-shirt Premium Noir', 89.00, 'T-shirt élégant en coton premium, finitions soignées', 1, true),
('Pantalon Chino Beige', 129.00, 'Pantalon chino coupe droite, tissu stretch confortable', 1, true),
('Pantalon Cargo Street', 149.00, 'Pantalon cargo moderne avec poches utilitaires', 1, true),
('Pantalon Jogger Sport', 119.00, 'Pantalon de sport décontracté, matière technique respirante', 1, true),
('Pull Over Col Rond', 159.00, 'Pull en laine mérinos, douceur et chaleur exceptionnelles', 1, true),
('Sweat Capuche Urban', 139.00, 'Sweat à capuche streetwear, coton molletonné épais', 1, true),

-- MAROQUINERIE
('Portefeuille Cuir Noir', 79.00, 'Portefeuille en cuir véritable, compartiments multiples', 2, true),
('Sac Bandoulière Vintage', 199.00, 'Sac en cuir vieilli, style vintage authentique', 2, true),
('Ceinture Cuir Marron', 65.00, 'Ceinture en cuir pleine fleur, boucle métal brossé', 2, true),
('Porte-cartes Minimaliste', 45.00, 'Porte-cartes compact en cuir, design épuré', 2, true);

-- 4. Images produits (store_productimage) - avec les vraies images
INSERT INTO store_productimage (product_id, image) VALUES 
(1, 'store/Shop/Articles/top-1-0.jpg'),
(1, 'store/Shop/Articles/top-1-1.jpg'),
(2, 'store/Shop/Articles/top-2-0.jpg'),
(2, 'store/Shop/Articles/top-2-1.jpg'),
(3, 'store/Shop/Articles/pants-1-0.jpg'),
(4, 'store/Shop/Articles/pants-2-0.jpg'),
(5, 'store/Shop/Articles/pants-3-0.jpg'),
(6, 'store/Shop/Articles/top-3-0.jpg'),
(7, 'store/Shop/Articles/top-4-0.jpg'),
(8, 'store/Shop/Articles/acc-1-0.jpg'),
(9, 'store/Shop/Articles/acc-2-0.jpg'),
(10, 'store/Shop/Articles/acc-3-0.jpg'),
(11, 'store/Shop/Articles/acc-4-0.jpg');


- Insertion des montres
INSERT INTO store_watch (id, name, description) VALUES 
(1, 'Watch1', 'Une montre élégante et moderne avec un design sophistiqué. Parfaite pour toutes les occasions.'),
(2, 'Watch2', 'Montre de luxe au style contemporain, alliant performance et esthétique raffinée.'),
(3, 'Tudor', 'Montre Tudor emblématique, symbole d''excellence horlogère et de tradition suisse.');

-- Insertion des médias pour Watch1
-- Images small
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(1, 'store/F&W/watch1-small-1.png', 'small', 'image'),
(1, 'store/F&W/watch1-small-2.png', 'small', 'image'),
(1, 'store/F&W/watch1-small-3.png', 'small', 'image');

-- Vidéos small
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(1, 'store/F&W/watch1-small-4.webm', 'small', 'video');

-- Images wide
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(1, 'store/F&W/watch1-wide-1.png', 'wide', 'image'),
(1, 'store/F&W/watch1-wide-2.png', 'wide', 'image'),
(1, 'store/F&W/watch1-wide-3.png', 'wide', 'image');

-- Vidéos wide
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(1, 'store/F&W/watch1-wide-4.webm', 'wide', 'video');

-- Insertion des médias pour Watch2
-- Images wide
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(2, 'store/F&W/watch2-wide-1.png', 'wide', 'image'),
(2, 'store/F&W/watch2-wide-2.png', 'wide', 'image'),
(2, 'store/F&W/watch2-wide-3.png', 'wide', 'image');

-- Vidéos wide
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(2, 'store/F&W/watch2-wide-4.webm', 'wide', 'video');

-- Insertion des médias pour Tudor
-- Images small
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(3, 'store/F&W/Tudor_small_1.jpg', 'small', 'image'),
(3, 'store/F&W/Tudor_small_2.jpg', 'small', 'image'),
(3, 'store/F&W/Tudor_small_3.jpg', 'small', 'image'),
(3, 'store/F&W/Tudor_small_4.jpg', 'small', 'image'),
(3, 'store/F&W/Tudor_small_5.jpg', 'small', 'image');

-- 7. Créneaux produits (store_slotsproduct)
INSERT INTO store_slotsproduct (date, start_time, end_time, is_available) VALUES 
-- Aujourd'hui et semaine prochaine
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
(CURRENT_DATE + 7, '14:00:00', '15:30:00', true);

-- 8. Créneaux montres (store_slotswatch) - Créneaux pour services
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
(CURRENT_DATE + 3, '14:00:00', '18:00:00', true);

-- 9. Réservations produits (store_bookingproduct)
INSERT INTO store_bookingproduct (name, product, date, start_time, end_time, created_at, is_canceled) VALUES 
('Pierre Dupont', 'Essayage T-shirt', CURRENT_DATE, '10:30:00', '12:00:00', NOW(), false),
('Marie Martin', 'Conseil Style', CURRENT_DATE + 1, '14:00:00', '15:30:00', NOW(), false),
('Jean Durand', 'Achat Pantalon', CURRENT_DATE + 3, '09:00:00', '10:30:00', NOW(), false),
('Sophie Bernard', 'Consultation Maroquinerie', CURRENT_DATE + 7, '10:30:00', '12:00:00', NOW(), false);

-- 10. Réservations montres (store_bookingwatch) - Réservations pour services
INSERT INTO store_bookingwatch (name, watch, date, start_time, end_time, created_at, is_canceled) VALUES 
('Pierre Dupont', 'Retouche Pantalon', CURRENT_DATE, '09:00:00', '11:00:00', NOW(), false),
('Marie Martin', 'Broderie Personnalisée', CURRENT_DATE, '16:00:00', '18:00:00', NOW(), false),
('Jean Durand', 'Nettoyage à Sec', CURRENT_DATE + 2, '08:00:00', '11:00:00', NOW(), false),
('Sophie Bernard', 'Réparation Sac Cuir', CURRENT_DATE + 3, '14:00:00', '18:00:00', NOW(), false),
('Paul Moreau', 'Pressing Express', CURRENT_DATE + 1, '08:00:00', '10:00:00', NOW(), true);

-- 11. Tags (tags_tag)
INSERT INTO tags_tag (label, description, created_at) VALUES 
('Mode', 'Articles de mode et tendance', NOW()),
('Coton', 'Matière coton naturel et biologique', NOW()),
('Cuir', 'Articles en cuir véritable', NOW()),
('Casual', 'Style décontracté et confortable', NOW()),
('Premium', 'Qualité premium et finitions soignées', NOW()),
('Streetwear', 'Style urbain et moderne', NOW()),
('Vintage', 'Style rétro et intemporel', NOW()),
('Eco-responsable', 'Matières et production éthiques', NOW());

-- 12. Objets tagués (tags_taggeditem)
INSERT INTO tags_taggeditem (tag_id, content_type_id, object_id, created_at) VALUES 
-- Tags pour vêtements
(1, (SELECT id FROM django_content_type WHERE model = 'product'), 1, NOW()), -- T-shirt blanc = Mode
(2, (SELECT id FROM django_content_type WHERE model = 'product'), 1, NOW()), -- T-shirt blanc = Coton
(5, (SELECT id FROM django_content_type WHERE model = 'product'), 1, NOW()), -- T-shirt blanc = Premium

(1, (SELECT id FROM django_content_type WHERE model = 'product'), 2, NOW()), -- T-shirt noir = Mode
(2, (SELECT id FROM django_content_type WHERE model = 'product'), 2, NOW()), -- T-shirt noir = Coton
(5, (SELECT id FROM django_content_type WHERE model = 'product'), 2, NOW()), -- T-shirt noir = Premium

(4, (SELECT id FROM django_content_type WHERE model = 'product'), 3, NOW()), -- Pantalon chino = Casual
(5, (SELECT id FROM django_content_type WHERE model = 'product'), 3, NOW()), -- Pantalon chino = Premium

(6, (SELECT id FROM django_content_type WHERE model = 'product'), 4, NOW()), -- Pantalon cargo = Streetwear
(4, (SELECT id FROM django_content_type WHERE model = 'product'), 4, NOW()), -- Pantalon cargo = Casual

-- Tags pour maroquinerie
(3, (SELECT id FROM django_content_type WHERE model = 'product'), 8, NOW()), -- Portefeuille = Cuir
(5, (SELECT id FROM django_content_type WHERE model = 'product'), 8, NOW()), -- Portefeuille = Premium

(3, (SELECT id FROM django_content_type WHERE model = 'product'), 9, NOW()), -- Sac = Cuir
(7, (SELECT id FROM django_content_type WHERE model = 'product'), 9, NOW()), -- Sac = Vintage

(3, (SELECT id FROM django_content_type WHERE model = 'product'), 10, NOW()), -- Ceinture = Cuir
(4, (SELECT id FROM django_content_type WHERE model = 'product'), 10, NOW()); -- Ceinture = Casual

-- Mettre à jour les featured_product des collections
UPDATE store_collection SET featured_product_id = 1 WHERE id = 1; -- T-shirt pour VETEMENTS
UPDATE store_collection SET featured_product_id = 8 WHERE id = 2; -- Portefeuille pour MAROQUINERIE

-- Réactiver les vérifications de clés étrangères
SET session_replication_role = DEFAULT;

-- Mise à jour des séquences pour éviter les conflits d'ID
SELECT setval('core_user_id_seq', (SELECT MAX(id) FROM core_user));
SELECT setval('store_collection_id_seq', (SELECT MAX(id) FROM store_collection));
SELECT setval('store_product_id_seq', (SELECT MAX(id) FROM store_product));
SELECT setval('store_productimage_id_seq', (SELECT MAX(id) FROM store_productimage));
SELECT setval('store_watch_id_seq', (SELECT MAX(id) FROM store_watch));
SELECT setval('store_watchmedia_id_seq', (SELECT MAX(id) FROM store_watchmedia));
SELECT setval('store_slotsproduct_id_seq', (SELECT MAX(id) FROM store_slotsproduct));
SELECT setval('store_slotswatch_id_seq', (SELECT MAX(id) FROM store_slotswatch));
SELECT setval('store_bookingproduct_id_seq', (SELECT MAX(id) FROM store_bookingproduct));
SELECT setval('store_bookingwatch_id_seq', (SELECT MAX(id) FROM store_bookingwatch));
SELECT setval('tags_tag_id_seq', (SELECT MAX(id) FROM tags_tag));
SELECT setval('tags_taggeditem_id_seq', (SELECT MAX(id) FROM tags_taggeditem));

-- Affichage de confirmation
SELECT 'Base de données Hoolis peuplée avec succès!' as message;
SELECT 
    (SELECT COUNT(*) FROM core_user) as utilisateurs,
    (SELECT COUNT(*) FROM store_collection) as collections,
    (SELECT COUNT(*) FROM store_product) as produits,
    (SELECT COUNT(*) FROM store_watch) as services,
    (SELECT COUNT(*) FROM store_bookingproduct) as reservations_produits,
    (SELECT COUNT(*) FROM store_bookingwatch) as reservations_services; 