from django.http import JsonResponse

def api_home(request):
    """Page d'accueil de l'API Hoolis"""
    return JsonResponse({
        'message': 'Bienvenue sur l\'API Hoolis! 🚀',
        'version': '1.0.0',
        'status': 'online',
        'endpoints': {
            'admin': '/admin/',
            'store': '/store/',
            'authentication': '/auth/',
        },
        'documentation': 'https://github.com/votre-repo/hoolis',
        'contact': 'admin@maisonhoolis.com'
    }) 