from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class PaymentRateThrottle(AnonRateThrottle):
    """
    Rate limiting strict pour les endpoints de paiement.
    Limite à 10 tentatives par heure par IP pour prévenir les attaques.
    """
    scope = 'payment'


class BurstRateThrottle(AnonRateThrottle):
    """
    Protection contre les rafales de requêtes (burst).
    Limite à 20 requêtes par minute par IP.
    """
    scope = 'burst'
