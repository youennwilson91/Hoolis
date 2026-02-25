"""
Utilitaires de sécurité pour l'application store
"""
import logging
import threading
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

class SafeErrorHandler:
    """
    Gestionnaire d'erreurs sécurisé pour éviter l'exposition d'informations sensibles
    """
    
    # Messages d'erreur génériques et sécurisés
    SAFE_ERROR_MESSAGES = {
        'VALIDATION_ERROR': 'Données invalides fournies',
        'PHONE_EXISTS': 'Ce numéro de téléphone est déjà utilisé',
        'PHONE_MISSING': 'Numéro de téléphone requis',
        'API_ERROR': 'Service temporairement indisponible',
        'UNKNOWN_ERROR': 'Une erreur est survenue',
        'UNAUTHORIZED': 'Accès non autorisé',
        'NOT_FOUND': 'Ressource non trouvée',
        'CONFLICT': 'Conflit détecté',
        'INVALID_CODE': 'Code de vérification invalide',
        'MISSING_FIELDS': 'Champs requis manquants',
        'VONAGE_ERROR': 'Erreur du service de SMS'
    }
    
    @staticmethod
    def get_safe_error_response(error_type, details=None, status_code=status.HTTP_400_BAD_REQUEST):
        """
        Retourne une réponse d'erreur sécurisée
        
        Args:
            error_type (str): Type d'erreur défini dans SAFE_ERROR_MESSAGES
            details (str, optional): Détails supplémentaires (seront loggés, pas exposés)
            status_code (int): Code de statut HTTP
            
        Returns:
            Response: Réponse Django REST Framework sécurisée
        """
        safe_message = SafeErrorHandler.SAFE_ERROR_MESSAGES.get(
            error_type, 
            SafeErrorHandler.SAFE_ERROR_MESSAGES['UNKNOWN_ERROR']
        )
        
        # Logger les détails pour le debug (sans les exposer au client)
        if details:
            logger.error(f"Error {error_type}: {details}")
        
        return Response(
            {"error": safe_message},
            status=status_code
        )
    
    @staticmethod
    def handle_exception(exception, context=""):
        """
        Gère une exception de manière sécurisée
        
        Args:
            exception (Exception): L'exception à traiter
            context (str): Contexte de l'erreur pour le logging
            
        Returns:
            Response: Réponse sécurisée
        """
        # Logger l'erreur complète pour le debug
        logger.error(f"Exception in {context}: {str(exception)}", exc_info=True)
        
        # Retourner une réponse générique au client
        return SafeErrorHandler.get_safe_error_response(
            'UNKNOWN_ERROR',
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def sanitize_phone_number(phone):
    """
    Sanitise et valide un numéro de téléphone
    
    Args:
        phone (str): Numéro de téléphone à sanitiser
        
    Returns:
        str: Numéro de téléphone sanitisé ou None si invalide
    """
    if not phone or not isinstance(phone, str):
        return None
    
    # Supprimer tous les caractères non numériques sauf + au début
    sanitized = ''.join(char for char in phone if char.isdigit() or (char == '+' and phone.index(char) == 0))
    
    # Valider la longueur (entre 10 et 15 chiffres internationalement)
    if len(sanitized.replace('+', '')) < 10 or len(sanitized.replace('+', '')) > 15:
        return None
        
    return sanitized

def sanitize_text_input(text, max_length=200):
    """
    Sanitise une entrée de texte
    
    Args:
        text (str): Texte à sanitiser
        max_length (int): Longueur maximale autorisée
        
    Returns:
        str: Texte sanitisé
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Supprimer les caractères de contrôle et limiter la longueur
    sanitized = ''.join(char for char in text if char.isprintable()).strip()
    
    # Limiter la longueur
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized

def log_security_event(event_type, details, request=None):
    """
    Enregistre un événement de sécurité

    Args:
        event_type (str): Type d'événement de sécurité
        details (str): Détails de l'événement
        request (HttpRequest, optional): Requête associée
    """
    log_message = f"SECURITY EVENT - {event_type}: {details}"

    if request:
        user_info = f"User: {getattr(request.user, 'username', 'Anonymous')}"
        ip_info = f"IP: {request.META.get('REMOTE_ADDR', 'Unknown')}"
        log_message += f" | {user_info} | {ip_info}"

    logger.warning(log_message)


def send_email_async(send_mail_callable, *args, **kwargs):
    """
    Envoie un email en arrière-plan via threading (solution simple sans Celery)

    Usage:
        send_email_async(
            send_mail,
            subject="Confirmation",
            message="...",
            from_email="noreply@maisonhoolis.com",
            recipient_list=["customer@example.com"],
            html_message="<html>...</html>"
        )

    Args:
        send_mail_callable: La fonction send_mail de Django
        *args, **kwargs: Arguments à passer à send_mail

    Note:
        - Pas de retry automatique (SMTP retry nativement)
        - Email perdu si serveur crash (acceptable en v1)
        - Pour production à fort volume, migrer vers Celery
    """
    def _send():
        try:
            send_mail_callable(*args, **kwargs)
            logger.info(f"Email envoyé avec succès (async) à {kwargs.get('recipient_list', [])}")
        except Exception as e:
            logger.error(f"Erreur envoi email async: {type(e).__name__} - {str(e)}", exc_info=True)

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()
    logger.info(f"Email délégué au thread (async) pour {kwargs.get('recipient_list', [])}") 