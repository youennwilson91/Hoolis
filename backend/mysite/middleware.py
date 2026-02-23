"""
Middleware custom pour bypasser le CSRF sur certaines URLs
"""

class DisableCSRFMiddleware:
    """
    Désactive la vérification CSRF pour les webhooks externes
    qui ne peuvent pas fournir de token CSRF (Stripe, etc.)
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # Paths qui doivent bypasser le CSRF
        self.exempt_paths = [
            '/store/stripe-webhook/',
        ]

    def __call__(self, request):
        # Vérifier si le path doit être exempté
        if any(request.path.startswith(path) for path in self.exempt_paths):
            setattr(request, '_dont_enforce_csrf_checks', True)

        return self.get_response(request)
