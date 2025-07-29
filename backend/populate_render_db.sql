-- Script SQL pour peupler la base de données Hoolis sur Render (PostgreSQL)
-- Version optimisée pour la production
-- Compatible avec les modèles Django et PostgreSQL

-- ============================================
-- NETTOYAGE PRÉALABLE (OPTIONNEL)
-- ============================================
-- Décommentez ces lignes si vous voulez nettoyer avant d'insérer
-- TRUNCATE TABLE store_bookingwatch RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE store_bookingproduct RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE store_slotswatch RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE store_slotsproduct RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE store_watchmedia RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE store_productimage RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE store_watch RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE store_product RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE store_collection RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE tags_taggeditem RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE tags_tag RESTART IDENTITY CASCADE;

-- ============================================
-- 1. COLLECTIONS
-- ============================================
INSERT INTO store_collection (id, name, description) VALUES 
(1, 'VETEMENTS', 'Collection de vêtements tendance et accessoires de mode'),
(2, 'MAROQUINERIE', 'Sacs, portefeuilles et accessoires en cuir de qualité')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. PRODUITS
-- ============================================
INSERT INTO store_product (id, title, price, description, collection_id, is_available) VALUES 
-- VETEMENTS
(1, 'T-shirt Premium Blanc', 89.00, 'T-shirt en coton biologique, coupe moderne et confortable. Matière douce et respirante, parfait pour un look casual chic.', 1, true),
(2, 'T-shirt Premium Noir', 89.00, 'T-shirt élégant en coton premium, finitions soignées. Un classique intemporel pour toutes les occasions.', 1, true),
(3, 'Pantalon Chino Beige', 129.00, 'Pantalon chino coupe droite, tissu stretch confortable. Idéal pour un look décontracté élégant.', 1, true),
(4, 'Pantalon Cargo Street', 149.00, 'Pantalon cargo moderne avec poches utilitaires. Design urbain et fonctionnel pour un style streetwear authentique.', 1, true),
(5, 'Pantalon Jogger Sport', 119.00, 'Pantalon de sport décontracté, matière technique respirante. Confort optimal pour le sport ou la détente.', 1, true),
(6, 'Pull Over Col Rond', 159.00, 'Pull en laine mérinos, douceur et chaleur exceptionnelles. Tricot de qualité pour les saisons froides.', 1, true),
(7, 'Sweat Capuche Urban', 139.00, 'Sweat à capuche streetwear, coton molletonné épais. Style urbain moderne avec une coupe confortable.', 1, true),

-- MAROQUINERIE
(8, 'Portefeuille Cuir Noir', 79.00, 'Portefeuille en cuir véritable, compartiments multiples. Design élégant et pratique pour organiser vos cartes et billets.', 2, true),
(9, 'Sac Bandoulière Vintage', 199.00, 'Sac en cuir vieilli, style vintage authentique. Spacieux et résistant, parfait pour un look rétro chic.', 2, true),
(10, 'Ceinture Cuir Marron', 65.00, 'Ceinture en cuir pleine fleur, boucle métal brossé. Accessoire indispensable pour compléter votre tenue.', 2, true),
(11, 'Porte-cartes Minimaliste', 45.00, 'Porte-cartes compact en cuir, design épuré. Solution moderne et élégante pour vos cartes essentielles.', 2, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. IMAGES PRODUITS
-- ============================================
INSERT INTO store_productimage (product_id, image) VALUES 
-- T-shirts
(1, 'store/Shop/Articles/top-1-0.jpg'),
(1, 'store/Shop/Articles/top-1-1.jpg'),
(2, 'store/Shop/Articles/top-2-0.jpg'),
(2, 'store/Shop/Articles/top-2-1.jpg'),
-- Pantalons
(3, 'store/Shop/Articles/pants-1-0.jpg'),
(4, 'store/Shop/Articles/pants-2-0.jpg'),
(5, 'store/Shop/Articles/pants-3-0.jpg'),
-- Pulls et sweats
(6, 'store/Shop/Articles/top-3-0.jpg'),
(7, 'store/Shop/Articles/top-4-0.jpg'),
-- Maroquinerie
(8, 'store/Shop/Articles/acc-1-0.jpg'),
(9, 'store/Shop/Articles/acc-2-0.jpg'),
(10, 'store/Shop/Articles/acc-3-0.jpg'),
(11, 'store/Shop/Articles/acc-4-0.jpg')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. MONTRES (avec prix ajoutés)
-- ============================================
INSERT INTO store_watch (id, name, description, price) VALUES 
(1, 'Watch1', 'Une montre élégante et moderne avec un design sophistiqué. Boîtier en acier inoxydable, mouvement précis et bracelet confortable. Parfaite pour toutes les occasions, du bureau aux sorties.', 2450.00),
(2, 'Watch2', 'Montre de luxe au style contemporain, alliant performance et esthétique raffinée. Cadran épuré avec finitions haut de gamme, étanchéité garantie et mécanisme de haute précision.', 3200.00),
(3, 'Tudor', 'Montre Tudor emblématique, symbole d''excellence horlogère et de tradition suisse. Héritage de savoir-faire exceptionnel, robustesse légendaire et design intemporel. Un investissement pour la vie.', 4800.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. MÉDIAS MONTRES
-- ============================================
-- Watch1 - Images small
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(1, 'store/F&W/watch1-small-1.png', 'small', 'image'),
(1, 'store/F&W/watch1-small-2.png', 'small', 'image'),
(1, 'store/F&W/watch1-small-3.png', 'small', 'image')
ON CONFLICT DO NOTHING;

-- Watch1 - Vidéos small
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(1, 'store/F&W/watch1-small-4.webm', 'small', 'video')
ON CONFLICT DO NOTHING;

-- Watch1 - Images wide
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(1, 'store/F&W/watch1-wide-1.png', 'wide', 'image'),
(1, 'store/F&W/watch1-wide-2.png', 'wide', 'image'),
(1, 'store/F&W/watch1-wide-3.png', 'wide', 'image')
ON CONFLICT DO NOTHING;

-- Watch1 - Vidéos wide
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(1, 'store/F&W/watch1-wide-4.webm', 'wide', 'video')
ON CONFLICT DO NOTHING;

-- Watch2 - Images wide
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(2, 'store/F&W/watch2-wide-1.png', 'wide', 'image'),
(2, 'store/F&W/watch2-wide-2.png', 'wide', 'image'),
(2, 'store/F&W/watch2-wide-3.png', 'wide', 'image')
ON CONFLICT DO NOTHING;

-- Watch2 - Vidéos wide
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(2, 'store/F&W/watch2-wide-4.webm', 'wide', 'video')
ON CONFLICT DO NOTHING;

-- Tudor - Images small
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
(3, 'store/F&W/Tudor_small_1.jpg', 'small', 'image'),
(3, 'store/F&W/Tudor_small_2.jpg', 'small', 'image'),
(3, 'store/F&W/Tudor_small_3.jpg', 'small', 'image'),
(3, 'store/F&W/Tudor_small_4.jpg', 'small', 'image'),
(3, 'store/F&W/Tudor_small_5.jpg', 'small', 'image')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. TAGS
-- ============================================
INSERT INTO tags_tag (id, label, description, created_at) VALUES 
(1, 'Mode', 'Articles de mode et tendance actuelles', NOW()),
(2, 'Coton', 'Matière coton naturel et biologique', NOW()),
(3, 'Cuir', 'Articles en cuir véritable de qualité', NOW()),
(4, 'Casual', 'Style décontracté et confortable', NOW()),
(5, 'Premium', 'Qualité premium et finitions soignées', NOW()),
(6, 'Streetwear', 'Style urbain et moderne', NOW()),
(7, 'Vintage', 'Style rétro et intemporel', NOW()),
(8, 'Eco-responsable', 'Matières et production éthiques', NOW()),
(9, 'Horlogerie', 'Montres et accessoires horlogers', NOW()),
(10, 'Luxe', 'Articles de luxe et haute gamme', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. MISE À JOUR DES PRODUITS VEDETTES
-- ============================================
UPDATE store_collection SET featured_product_id = 1 WHERE id = 1; -- T-shirt blanc pour VETEMENTS
UPDATE store_collection SET featured_product_id = 8 WHERE id = 2; -- Portefeuille pour MAROQUINERIE

-- ============================================
-- 10. MISE À JOUR DES SÉQUENCES POSTGRESQL
-- ============================================
-- Correction des séquences pour éviter les conflits d'ID lors de nouveaux ajouts
SELECT setval(pg_get_serial_sequence('store_collection', 'id'), COALESCE(MAX(id), 1)) FROM store_collection;
SELECT setval(pg_get_serial_sequence('store_product', 'id'), COALESCE(MAX(id), 1)) FROM store_product;
SELECT setval(pg_get_serial_sequence('store_productimage', 'id'), COALESCE(MAX(id), 1)) FROM store_productimage;
SELECT setval(pg_get_serial_sequence('store_watch', 'id'), COALESCE(MAX(id), 1)) FROM store_watch;
SELECT setval(pg_get_serial_sequence('store_watchmedia', 'id'), COALESCE(MAX(id), 1)) FROM store_watchmedia;
SELECT setval(pg_get_serial_sequence('store_slotsproduct', 'id'), COALESCE(MAX(id), 1)) FROM store_slotsproduct;
SELECT setval(pg_get_serial_sequence('store_slotswatch', 'id'), COALESCE(MAX(id), 1)) FROM store_slotswatch;
SELECT setval(pg_get_serial_sequence('tags_tag', 'id'), COALESCE(MAX(id), 1)) FROM tags_tag;

-- ============================================
-- 11. STATISTIQUES FINALES
-- ============================================
SELECT 
    '🎉 Base de données Hoolis peuplée avec succès sur Render!' as message,
    NOW() as timestamp;

SELECT 
    'STATISTIQUES:' as section,
    (SELECT COUNT(*) FROM store_collection) as collections,
    (SELECT COUNT(*) FROM store_product) as produits,
    (SELECT COUNT(*) FROM store_productimage) as images_produits,
    (SELECT COUNT(*) FROM store_watch) as montres,
    (SELECT COUNT(*) FROM store_watchmedia) as medias_montres,
    (SELECT COUNT(*) FROM store_slotsproduct) as creneaux_produits,
    (SELECT COUNT(*) FROM store_slotswatch) as creneaux_montres,
    (SELECT COUNT(*) FROM tags_tag) as tags;

-- ============================================
-- 12. VÉRIFICATIONS
-- ============================================
-- Vérifier que toutes les images/médias référencés existent
SELECT 'VÉRIFICATIONS:' as section;

SELECT 
    'Produits avec images:' as check_type,
    COUNT(DISTINCT p.id) as count
FROM store_product p 
INNER JOIN store_productimage pi ON p.id = pi.product_id;

SELECT 
    'Montres avec médias:' as check_type,
    COUNT(DISTINCT w.id) as count
FROM store_watch w 
INNER JOIN store_watchmedia wm ON w.id = wm.watch_id;

SELECT 
    'Collections avec produit vedette:' as check_type,
    COUNT(*) as count
FROM store_collection 
WHERE featured_product_id IS NOT NULL;

-- FIN DU SCRIPT 