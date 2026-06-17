from django.http import JsonResponse
from .models import SiteConfig


def site_config(request):
    config = SiteConfig.get()
    return JsonResponse({
        "bg_image_desktop": request.build_absolute_uri(config.bg_image_desktop.url) if config.bg_image_desktop else None,
        "bg_image_mobile": request.build_absolute_uri(config.bg_image_mobile.url) if config.bg_image_mobile else None,
        "bg_fit": config.bg_fit,
    })
