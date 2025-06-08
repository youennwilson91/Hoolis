-- Script SQL pour générer les créneaux de juin à octobre 2025
-- De 10h à 20h tous les jours avec des créneaux d'1 heure

-- ========================================
-- GÉNÉRATION DES CRÉNEAUX PRODUITS (store_slotsproduct)
-- ========================================

-- Fonction pour générer toutes les dates entre juin et octobre 2025
WITH date_series AS (
    SELECT generate_series(
        '2025-06-01'::date,
        '2025-10-31'::date,
        '1 day'::interval
    )::date AS slot_date
),
-- Créneaux horaires de 10h à 20h (créneaux d'1 heure)
time_slots AS (
    SELECT start_time::time, end_time::time
    FROM (VALUES 
        ('10:00:00', '11:00:00'),
        ('11:00:00', '12:00:00'),
        ('12:00:00', '13:00:00'),
        ('13:00:00', '14:00:00'),
        ('14:00:00', '15:00:00'),
        ('15:00:00', '16:00:00'),
        ('16:00:00', '17:00:00'),
        ('17:00:00', '18:00:00'),
        ('18:00:00', '19:00:00'),
        ('19:00:00', '20:00:00')
    ) AS slots(start_time, end_time)
)
-- Insertion dans store_slotsproduct
INSERT INTO store_slotsproduct (date, start_time, end_time, is_available)
SELECT 
    date_series.slot_date,
    time_slots.start_time,
    time_slots.end_time,
    true as is_available
FROM date_series
CROSS JOIN time_slots
ORDER BY slot_date, start_time;

-- ========================================
-- GÉNÉRATION DES CRÉNEAUX MONTRES (store_slotswatch)
-- ========================================

-- Même principe pour les créneaux montres
WITH date_series AS (
    SELECT generate_series(
        '2025-06-01'::date,
        '2025-10-31'::date,
        '1 day'::interval
    )::date AS slot_date
),
-- Créneaux horaires de 10h à 20h (créneaux d'1 heure)
time_slots AS (
    SELECT start_time::time, end_time::time
    FROM (VALUES 
        ('10:00:00', '11:00:00'),
        ('11:00:00', '12:00:00'),
        ('12:00:00', '13:00:00'),
        ('13:00:00', '14:00:00'),
        ('14:00:00', '15:00:00'),
        ('15:00:00', '16:00:00'),
        ('16:00:00', '17:00:00'),
        ('17:00:00', '18:00:00'),
        ('18:00:00', '19:00:00'),
        ('19:00:00', '20:00:00')
    ) AS slots(start_time, end_time)
)
-- Insertion dans store_slotswatch
INSERT INTO store_slotswatch (date, start_time, end_time, is_available)
SELECT 
    date_series.slot_date,
    time_slots.start_time,
    time_slots.end_time,
    true as is_available
FROM date_series
CROSS JOIN time_slots
ORDER BY slot_date, start_time;

-- ========================================
-- VÉRIFICATION DES RÉSULTATS
-- ========================================

-- Vérifier le nombre de créneaux créés pour les produits
SELECT 
    'Créneaux Produits' as type,
    COUNT(*) as total_slots,
    MIN(date) as date_debut,
    MAX(date) as date_fin,
    MIN(start_time) as heure_debut,
    MAX(end_time) as heure_fin
FROM store_slotsproduct 
WHERE date BETWEEN '2025-06-01' AND '2025-10-31';

-- Vérifier le nombre de créneaux créés pour les montres
SELECT 
    'Créneaux Montres' as type,
    COUNT(*) as total_slots,
    MIN(date) as date_debut,
    MAX(date) as date_fin,
    MIN(start_time) as heure_debut,
    MAX(end_time) as heure_fin
FROM store_slotswatch 
WHERE date BETWEEN '2025-06-01' AND '2025-10-31';

-- Afficher un échantillon des créneaux créés pour une journée
SELECT 
    'Exemple journée' as info,
    date,
    start_time,
    end_time,
    is_available
FROM store_slotsproduct 
WHERE date = '2025-06-01'
ORDER BY start_time
LIMIT 10;

-- ========================================
-- NETTOYAGE (optionnel)
-- ========================================
-- Si vous voulez supprimer tous les créneaux existants avant de relancer le script :
-- DELETE FROM store_slotsproduct WHERE date BETWEEN '2025-06-01' AND '2025-10-31';
-- DELETE FROM store_slotswatch WHERE date BETWEEN '2025-06-01' AND '2025-10-31';

-- ========================================
-- STATISTIQUES FINALES
-- ========================================
-- Calcul du nombre total de créneaux générés
-- 153 jours (juin à octobre) × 10 créneaux par jour = 1530 créneaux par table
-- Total : 3060 créneaux (produits + montres) 