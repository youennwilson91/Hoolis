from django.utils.cache import patch_cache_control


class CacheControlMixin:
    """
    Mixin pour ajouter des headers Cache-Control aux réponses GET réussies.

    Utilise deux niveaux de cache:
    - max_age: durée de cache navigateur (client-side)
    - s_maxage: durée de cache CDN/proxy (shared cache)

    Usage:
        class ProductViewSet(CacheControlMixin, ModelViewSet):
            cache_max_age = 600  # 10 minutes navigateur
            cache_s_maxage = 3600  # 1 heure CDN
    """
    cache_max_age = 600  # 10 minutes par défaut (navigateur)
    cache_s_maxage = 3600  # 1 heure par défaut (CDN)
    cache_public = True  # Cache public (peut être partagé)

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)

        # Appliquer le cache uniquement sur GET avec succès
        if request.method == 'GET' and response.status_code == 200:
            patch_cache_control(
                response,
                max_age=self.cache_max_age,
                s_maxage=self.cache_s_maxage,
                public=self.cache_public
            )

        return response
