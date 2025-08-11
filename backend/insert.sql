-- populate_db.sql
-- Script pour peupler la base de données Hoolis
-- Collections, Produits, Images, Slots pour août-septembre 2025

-- 1. Nettoyer les tables existantes
TRUNCATE TABLE store_productimage CASCADE;
TRUNCATE TABLE store_product CASCADE;
TRUNCATE TABLE store_collection CASCADE;
TRUNCATE TABLE store_slotsproduct CASCADE;
TRUNCATE TABLE store_slotswatch CASCADE;
TRUNCATE TABLE store_watchmedia CASCADE;
TRUNCATE TABLE store_watch CASCADE;

-- 2. Créer les collections
INSERT INTO store_collection (name, description) VALUES 
('VETEMENTS', 'Collection de vêtements Hoolis'),
('MAROQUINERIE', 'Collection de maroquinerie et accessoires');

-- 3. Créer les produits VETEMENTS
INSERT INTO store_product (title, price, description, collection_id, is_available) VALUES 
('T-shirt Coquillage', 45.00, 'T-shirt premium avec design coquillage', 
 (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true),
('T-shirt Mouth', 45.00, 'T-shirt avec design bouche artistique', 
 (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true),
('Vest Marc', 85.00, 'Veste légère style Marc', 
 (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true),
('Polito Tee', 40.00, 'T-shirt casual Polito', 
 (SELECT id FROM store_collection WHERE name = 'VETEMENTS'), true);

-- 4. Créer les produits MAROQUINERIE
INSERT INTO store_product (title, price, description, collection_id, is_available) VALUES 
('Accessoire 1', 25.00, 'Accessoire de maroquinerie premium', 
 (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true),
('Accessoire 2', 30.00, 'Accessoire de maroquinerie design', 
 (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true),
('Accessoire 3', 35.00, 'Accessoire de maroquinerie luxe', 
 (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true),
('Sac Premium', 120.00, 'Sac en cuir premium', 
 (SELECT id FROM store_collection WHERE name = 'MAROQUINERIE'), true);

-- 5. Ajouter les images des produits
INSERT INTO store_productimage (product_id, image) VALUES 
((SELECT id FROM store_product WHERE title = 'T-shirt Coquillage'), 'store/Shop/Articles/acc-1-0.jpg'),
((SELECT id FROM store_product WHERE title = 'T-shirt Mouth'), 'store/Shop/Articles/acc-2-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Vest Marc'), 'store/Shop/Articles/acc-3-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Polito Tee'), 'store/Shop/Articles/acc-4-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Accessoire 1'), 'store/Shop/Articles/acc-5-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Accessoire 2'), 'store/Shop/Articles/acc-6-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Accessoire 3'), 'store/Shop/Articles/acc-7-0.jpg'),
((SELECT id FROM store_product WHERE title = 'Sac Premium'), 'store/Shop/Articles/acc-8-0.jpg');

-- 6. Créer les montres F&W
INSERT INTO store_watch (name, price, description, is_available) VALUES 
('Rolex Submariner', 8500.00, 'Montre Rolex Submariner classique', true),
('Tudor Black Bay', 3200.00, 'Tudor Black Bay heritage', true),
('Omega Speedmaster', 4800.00, 'Omega Speedmaster Professional', true),
('Cartier Santos', 6200.00, 'Cartier Santos de Cartier', true);

-- 7. Ajouter les médias des montres
INSERT INTO store_watchmedia (watch_id, media, size, type) VALUES 
((SELECT id FROM store_watch WHERE name = 'Rolex Submariner'), 'store/F&W/rolex1-small.png', 'small', 'image'),
((SELECT id FROM store_watch WHERE name = 'Tudor Black Bay'), 'store/F&W/Tudor_small_0.jpg', 'small', 'image'),
((SELECT id FROM store_watch WHERE name = 'Tudor Black Bay'), 'store/F&W/Tudor_small_1.jpg', 'small', 'image'),
((SELECT id FROM store_watch WHERE name = 'Tudor Black Bay'), 'store/F&W/Tudor_small_2.jpg', 'small', 'image'),
((SELECT id FROM store_watch WHERE name = 'Omega Speedmaster'), 'store/F&W/watch1-small-1.png', 'small', 'image'),
((SELECT id FROM store_watch WHERE name = 'Omega Speedmaster'), 'store/F&W/watch1-wide-1.png', 'wide', 'image'),
((SELECT id FROM store_watch WHERE name = 'Cartier Santos'), 'store/F&W/watch2-wide-1.png', 'wide', 'image'),
((SELECT id FROM store_watch WHERE name = 'Cartier Santos'), 'store/F&W/watch2-wide-2.png', 'wide', 'image');

-- 8. Créer les slots produits pour août-septembre 2025
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

-- 9. Créer les slots montres (mêmes créneaux)
INSERT INTO store_slotswatch (date, start_time, end_time, is_available) VALUES 
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
SELECT COUNT(*) as watches FROM store_watch;
SELECT COUNT(*) as product_slots FROM store_slotsproduct;
SELECT COUNT(*) as watch_slots FROM store_slotswatch;