from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
import json

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
            'verify_access': '/api/verify-access/',
        },
        'documentation': 'https://github.com/votre-repo/hoolis',
        'contact': 'admin@hoolis.com'
    })

@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def verify_access(request):
    # Gérer les requêtes preflight OPTIONS
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '*')
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            password = data.get('password', '')
            
            # Vérifier le mot de passe avec celui du settings
            preview_password = getattr(settings, 'PREVIEW_PASSWORD', 'demo')
            
            if password == preview_password:
                # Créer la session Django pour lever la protection du middleware
                request.session['has_access'] = True
                response = JsonResponse({'success': True})
            else:
                response = JsonResponse({'success': False}, status=401)
                
            # Ajouter les headers CORS explicitement
            response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
                
        except json.JSONDecodeError:
            response = JsonResponse({'error': 'Invalid JSON'}, status=400)
            response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '*')
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
    
    response = JsonResponse({'error': 'Method not allowed'}, status=405)
    response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '*')
    response['Access-Control-Allow-Credentials'] = 'true'
    return response 