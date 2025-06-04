#!/usr/bin/env python
"""
Script pour démarrer Django avec HTTPS en développement
"""
import os
import sys
import subprocess

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
    
    try:
        # Démarrer le serveur avec HTTPS
        subprocess.run([
            sys.executable, 
            "manage.py", 
            "runserver_plus", 
            "--cert-file", "cert.crt",
            "0.0.0.0:8000"
        ])
    except Exception as e:
        print(f"Erreur lors du démarrage du serveur HTTPS: {e}")
        print("Assurez-vous que django-extensions est installé:")
        print("pip install django-extensions Werkzeug pyOpenSSL") 