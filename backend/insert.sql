-- populate_db.sql
-- Script pour peupler la base de données Hoolis
-- Collections, Produits, Images, Slots pour août-septembre 2025

-- 1. Nettoyer les tables existantes
TRUNCATE TABLE store_productimage CASCADE;
TRUNCATE TABLE store_product CASCADE;
TRUNCATE TABLE store_collection CASCADE;
TRUNCATE TABLE store_slotsproduct CASCADE;

-- 2. Créer les collections
INSERT INTO store_collection (name, description, is_resell) VALUES 
('VETEMENTS', 'Collection de vêtements Hoolis', false),
('MAROQUINERIE', 'Collection de maroquinerie et accessoires', false),
('SACS', 'Selection de sacs', true),
('MONTRES', 'Selection de montres', true),
('ACCESSOIRES', 'Selection d''accessoires', true);

-- 3. Créer les produits VETEMENTS
INSERT INTO store_product (title, price, description, collection_id, is_available, is_resell) VALUES 
('T-shirt Coquillage', 45.00, 'T-shirt premium avec design coquillage', 
 (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true, false),
('T-shirt Mouth', 45.00, 'T-shirt avec design bouche artistique', 
 (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true, false),
('Vest Marc', 85.00, 'Veste légère style Marc', 
 (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true, false),
('Polito Tee', 40.00, 'T-shirt casual Polito', 
 (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true, false);

-- 4. Créer les produits MAROQUINERIE
INSERT INTO store_product (title, price, description, collection_id, is_available, is_resell) VALUES 
('Accessoire 1', 25.00, 'Accessoire de maroquinerie premium', 
 (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true, false),
('Accessoire 2', 30.00, 'Accessoire de maroquinerie design', 
 (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true, false),
('Accessoire 3', 35.00, 'Accessoire de maroquinerie luxe', 
 (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true, false),
('Sac Premium', 120.00, 'Sac en cuir premium', 
 (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true, false);

-- 5. Créer les produits SACS
INSERT INTO store_product (title, price, description, collection_id, is_available, is_resell) VALUES 
('Sac à main Premium', 150.00, 'Sac à main élégant en cuir', 
 (SELECT id FROM store_collection WHERE name = 'SACS'), true, true),
('Sac bandoulière', 95.00, 'Sac bandoulière moderne', 
 (SELECT id FROM store_collection WHERE name = 'SACS'), true, true),
('Sac cabas', 110.00, 'Grand sac cabas pratique', 
 (SELECT id FROM store_collection WHERE name = 'SACS'), true, true),
('Sac besace', 85.00, 'Sac besace design', 
 (SELECT id FROM store_collection WHERE name = 'SACS'), true, true);

-- 6. Créer les produits MONTRES
INSERT INTO store_product (title, price, description, collection_id, is_available, is_resell) VALUES 
('Montre Classique', 250.00, 'Montre élégante et intemporelle', 
 (SELECT id FROM store_collection WHERE name = 'MONTRES'), true, true),
('Montre Sport', 180.00, 'Montre sportive résistante', 
 (SELECT id FROM store_collection WHERE name = 'MONTRES'), true, true),
('Montre Design', 320.00, 'Montre au design contemporain', 
 (SELECT id FROM store_collection WHERE name = 'MONTRES'), true, true),
('Montre Vintage', 280.00, 'Montre style vintage authentique', 
 (SELECT id FROM store_collection WHERE name = 'MONTRES'), true, true);

-- 7. Créer les produits ACCESSOIRES
INSERT INTO store_product (title, price, description, collection_id, is_available, is_resell) VALUES 
('Portefeuille Cuir', 65.00, 'Portefeuille en cuir véritable', 
 (SELECT id FROM store_collection WHERE name = 'ACCESSOIRES'), true, true),
('Ceinture Premium', 55.00, 'Ceinture en cuir premium', 
 (SELECT id FROM store_collection WHERE name = 'ACCESSOIRES'), true, true),
('Lunettes de Soleil', 120.00, 'Lunettes de soleil design', 
 (SELECT id FROM store_collection WHERE name = 'ACCESSOIRES'), true, true),
('Écharpe Soie', 75.00, 'Écharpe en soie luxueuse', 
 (SELECT id FROM store_collection WHERE name = 'ACCESSOIRES'), true, true);

-- 8. Ajouter les images des produits
INSERT INTO store_productimage (product_id, image) VALUES 
((SELECT id FROM store_product WHERE title = 'T-shirt Coquillage'), 'store/Shop/Articles/acc-1-0.jpg'),
((SELECT id FROM store_product WHERE title = 'T-shirt Mouth'), 'store/Shop/Articles/acc-2-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Vest Marc'), 'store/Shop/Articles/acc-3-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Polito Tee'), 'store/Shop/Articles/acc-4-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Accessoire 1'), 'store/Shop/Articles/acc-5-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Accessoire 2'), 'store/Shop/Articles/acc-6-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Accessoire 3'), 'store/Shop/Articles/acc-7-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Sac Premium'), 'store/Shop/Articles/acc-8-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Sac à main Premium'), 'store/Shop/Articles/acc-1-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Sac bandoulière'), 'store/Shop/Articles/acc-2-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Sac cabas'), 'store/Shop/Articles/acc-3-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Sac besace'), 'store/Shop/Articles/acc-4-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Montre Classique'), 'store/Shop/Articles/acc-5-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Montre Sport'), 'store/Shop/Articles/acc-6-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Montre Design'), 'store/Shop/Articles/acc-7-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Montre Vintage'), 'store/Shop/Articles/acc-8-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Portefeuille Cuir'), 'store/Shop/Articles/acc-1-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Ceinture Premium'), 'store/Shop/Articles/acc-2-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Lunettes de Soleil'), 'store/Shop/Articles/acc-3-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Écharpe Soie'), 'store/Shop/Articles/acc-4-0.jpg');


-- 9. Créer les slots produits pour août-septembre 2025
INSERT INTO store_slotsproduct (date, start_time, end_time, is_available) VALUES 
-- Août 2025
('2025-08-01', '09:00:00', '10:00:00', true),
('2025-08-01', '10:00:00', '11:00:00', true),
('2025-08-01', '14:00:00', '15:00:00', true),
('2025-08-01', '15:00:00', '16:00:00', true),
('2025-08-01', '16:00:00', '17:00:00', true),

('2025-08-05', '09:00:00', '10:00:00', true),
('2025-08-05', '10:00:00', '11:00:00', true),
('2025-08-05', '14:00:00', '15:00:00', true),
('2025-08-05', '15:00:00', '16:00:00', true),
('2025-08-05', '16:00:00', '17:00:00', true),

('2025-08-10', '09:00:00', '10:00:00', true),
('2025-08-10', '10:00:00', '11:00:00', true),
('2025-08-10', '14:00:00', '15:00:00', true),
('2025-08-10', '15:00:00', '16:00:00', true),
('2025-08-10', '16:00:00', '17:00:00', true),

('2025-08-15', '09:00:00', '10:00:00', true),
('2025-08-15', '10:00:00', '11:00:00', true),
('2025-08-15', '14:00:00', '15:00:00', true),
('2025-08-15', '15:00:00', '16:00:00', true),
('2025-08-15', '16:00:00', '17:00:00', true),

('2025-08-20', '09:00:00', '10:00:00', true),
('2025-08-20', '10:00:00', '11:00:00', true),
('2025-08-20', '14:00:00', '15:00:00', true),
('2025-08-20', '15:00:00', '16:00:00', true),
('2025-08-20', '16:00:00', '17:00:00', true),

-- Septembre 2025
('2025-09-01', '09:00:00', '10:00:00', true),
('2025-09-01', '10:00:00', '11:00:00', true),
('2025-09-01', '14:00:00', '15:00:00', true),
('2025-09-01', '15:00:00', '16:00:00', true),
('2025-09-01', '16:00:00', '17:00:00', true),

('2025-09-05', '09:00:00', '10:00:00', true),
('2025-09-05', '10:00:00', '11:00:00', true),
('2025-09-05', '14:00:00', '15:00:00', true),
('2025-09-05', '15:00:00', '16:00:00', true),
('2025-09-05', '16:00:00', '17:00:00', true),

('2025-09-15', '09:00:00', '10:00:00', true),
('2025-09-15', '10:00:00', '11:00:00', true),
('2025-09-15', '14:00:00', '15:00:00', true),
('2025-09-15', '15:00:00', '16:00:00', true),
('2025-09-15', '16:00:00', '17:00:00', true);

-- Message de confirmation
SELECT 'Base de données peuplée avec succès!' as message;
SELECT COUNT(*) as collections FROM store_collection;
SELECT COUNT(*) as products FROM store_product;
SELECT COUNT(*) as product_slots FROM store_slotsproduct;