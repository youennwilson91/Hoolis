from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
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
            'check_access': '/api/check-access/',
        },
        'documentation': 'https://github.com/votre-repo/hoolis',
        'contact': 'admin@hoolis.com'
    })

@csrf_exempt
def verify_access(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            password = data.get('password', '')
            
            # Vérifier le mot de passe avec celui du settings
            preview_password = getattr(settings, 'PREVIEW_PASSWORD', 'demo')
            
            if password == preview_password:
                # Créer la session Django pour lever la protection du middleware
                request.session['has_access'] = True
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False}, status=401)
                
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def check_access(request):
    """Vérifier si l'utilisateur a déjà accès via la session Django"""
    if request.method == 'GET':
        has_access = request.session.get('has_access', False)
        return JsonResponse({'has_access': has_access})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405) 