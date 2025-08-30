from django.contrib import admin
from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.views.generic import TemplateView
from . import views
import os

urlpatterns = [
    # API Routes - DOIVENT être avant le catch-all
    path('api/', views.api_home, name='api_home'),  # Changé pour éviter les conflits
    path('admin/', admin.site.urls),
    path('store/', include('store.urls')),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]

# Servir les fichiers média
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# En production, ajouter explicitement la route pour les médias
if not settings.DEBUG:
    from django.views.static import serve
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]

if settings.DEBUG:
    urlpatterns += [
        path('__debug__/', include('debug_toolbar.urls')),
    ]

# API Home pour la racine
urlpatterns += [
    path('', views.api_home, name='home'),
]