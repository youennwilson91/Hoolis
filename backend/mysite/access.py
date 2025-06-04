from django.shortcuts import redirect
from django.http import HttpResponse
from django.conf import settings

class PasswordProtectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.password = getattr(settings, 'PREVIEW_PASSWORD', 'demo')

    def __call__(self, request):
        # Ne pas protéger les endpoints API et admin
        if (request.path.startswith('/api/') or 
            request.path.startswith('/admin/') or 
            request.path.startswith('/auth/') or 
            request.path.startswith('/store/') or
            request.path == '/'):  # Permettre l'accès à la racine de l'API
            return self.get_response(request)

        if request.session.get('has_access'):
            return self.get_response(request)

        if request.method == 'POST' and request.path == '/access':
            if request.POST.get('password') == self.password:
                request.session['has_access'] = True
                return redirect('/')
            return HttpResponse('Mot de passe incorrect', status=403)

        return HttpResponse('''
            <form method="post" action="/access">
                <input type="password" name="password" placeholder="Mot de passe"/>
                <button type="submit">Entrer</button>
            </form>
        ''')