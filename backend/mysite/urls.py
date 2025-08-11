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
    path('', views.api_home, name='api_home'),  # Page d'accueil API sur /
    path('api/', views.api_home, name='api_home_alt'),  # Alternative sur /api/
    path('admin/', admin.site.urls),
    path('store/', include('store.urls')),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]

# Servir les fichiers média en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Servir les assets statiques React (CSS, JS, etc.)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Servir les fichiers du dossier dist de Vite
    urlpatterns += [
        re_path(r'^assets/(?P<path>.*)$', serve, {
            'document_root': settings.BASE_DIR.parent / 'frontend' / 'dist' / 'assets',
        }),
        re_path(r'^(?P<path>.*\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|webm|mp4|ttf|woff|woff2|eot|json|xml|txt|webmanifest))$', serve, {
            'document_root': settings.BASE_DIR.parent / 'frontend' / 'dist',
        }),
    ]
else:
    # Servir les fichiers média en production
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]

if settings.DEBUG:
    urlpatterns += [
        path('__debug__/', include('debug_toolbar.urls')),
    ]

# Catch-all pour React Router - Décommentez si vous voulez que Django serve React
# urlpatterns += [
#     re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='react_app'),
# ]

# React servi sur /app/ uniquement
urlpatterns += [
    path('app/', TemplateView.as_view(template_name='index.html'), name='react_app'),
]
