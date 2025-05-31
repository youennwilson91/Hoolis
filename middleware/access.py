from django.shortcuts import redirect
from django.http import HttpResponse
from django.conf import settings

class PasswordProtectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.password = getattr(settings, 'PREVIEW_PASSWORD', 'demo123')

    def __call__(self, request):
        # On laisse passer l'accès à certaines routes
        if request.path.startswith('/admin/') or request.path.startswith('/api/'):
            return self.get_response(request)

        # Si l'utilisateur est déjà authentifié (par session)
        if request.session.get('has_access'):
            return self.get_response(request)

        # Si l'utilisateur soumet le mot de passe
        if request.method == 'POST' and request.path == '/access':
            if request.POST.get('password') == self.password:
                request.session['has_access'] = True
                return redirect('/')
            return HttpResponse('Mot de passe incorrect', status=403)

        # Sinon, afficher le formulaire de mot de passe
        return HttpResponse('''
            <html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
                <form method="post" action="/access" style="display:flex;flex-direction:column;gap:1rem;">
                    <h2>Accès protégé</h2>
                    <input type="password" name="password" placeholder="Mot de passe" style="padding:0.5rem;"/>
                    <button type="submit" style="padding:0.5rem;">Entrer</button>
                </form>
            </body></html>
        ''')