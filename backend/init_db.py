#!/usr/bin/env python3
"""
Script d'initialisation de la base de données Hoolis
À exécuter après les migrations pour créer les données de base
"""
import os
import sys
import django

# Configuration de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

def init_database():
    """Initialise la base de données avec les données de base"""
    print("🚀 Initialisation de la base de données Hoolis...")
    
    with transaction.atomic():
        # Créer le superuser admin
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@hoolis.com',
                password='hoolis2025!',
                first_name='Admin',
                last_name='Hoolis'
            )
            print(f"✅ Superuser créé: {admin.username}")
        else:
            print("ℹ️ Superuser admin existe déjà")
        
        # Créer un utilisateur de test
        if not User.objects.filter(username='testuser').exists():
            test_user = User.objects.create_user(
                username='testuser',
                email='test@hoolis.com',
                password='test123456',
                first_name='Test',
                last_name='User'
            )
            print(f"✅ Utilisateur de test créé: {test_user.username}")
        else:
            print("ℹ️ Utilisateur de test existe déjà")
    
    print("✅ Initialisation terminée!")
    print("\n📋 Credentials créés:")
    print("  Admin: admin / hoolis2025!")
    print("  Test:  testuser / test123456")

if __name__ == '__main__':
    try:
        init_database()
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {e}")
        sys.exit(1) 