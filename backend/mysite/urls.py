from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('', views.api_home, name='api_home'),  # Page d'accueil de l'API
    path('admin/', admin.site.urls),
    path('store/', include('store.urls')),
    path('auth/', include('djoser.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += [
        path('__debug__/', include('debug_toolbar.urls')),
    ]
