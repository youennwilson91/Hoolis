from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf.urls.static import static
from django.http import JsonResponse
from . import views

def api_root(request):
    """Vue racine de l'API"""
    return JsonResponse({
        'message': 'Hoolis API v1.0',
        'status': 'active',
        'endpoints': {
            'admin': '/admin/',
            'store': '/store/',
            'auth': '/auth/',
            'verify_access': '/api/verify-access/',
            'check_access': '/api/check-access/',
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('store/', include('store.urls')),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('api/verify-access/', views.verify_access, name='verify_access'),
    path('api/check-access/', views.check_access, name='check_access'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += [
        path('__debug__/', include('debug_toolbar.urls')),
    ]
