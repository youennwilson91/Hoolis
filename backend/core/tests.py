import json
import pytest
from django.test import Client
from core.models import SiteConfig

CONFIG_URL = '/core/config/'


@pytest.mark.django_db
class TestSiteConfigEndpoint:
    def test_default_config_created_on_first_call(self):
        assert SiteConfig.objects.count() == 0

        client = Client()
        response = client.get(CONFIG_URL)

        assert response.status_code == 200
        data = json.loads(response.content)
        assert data['bg_fit'] == SiteConfig.ImageFit.COVER
        assert data['bg_padding_top'] == 0
        assert data['bg_padding_bottom'] == 0
        assert data['bg_padding_left'] == 0
        assert data['bg_padding_right'] == 0
        assert data['bg_image_desktop'] is None
        assert data['bg_image_mobile'] is None
        assert SiteConfig.objects.count() == 1

    def test_custom_config_values_are_returned(self):
        SiteConfig.objects.create(
            bg_fit=SiteConfig.ImageFit.CONTAIN,
            bg_padding_top=10,
            bg_padding_bottom=20,
            bg_padding_left=30,
            bg_padding_right=40,
        )

        client = Client()
        response = client.get(CONFIG_URL)

        assert response.status_code == 200
        data = json.loads(response.content)
        assert data['bg_fit'] == SiteConfig.ImageFit.CONTAIN
        assert data['bg_padding_top'] == 10
        assert data['bg_padding_bottom'] == 20
        assert data['bg_padding_left'] == 30
        assert data['bg_padding_right'] == 40

    def test_endpoint_is_public(self):
        client = Client()
        response = client.get(CONFIG_URL)

        assert response.status_code == 200


@pytest.mark.django_db
class TestSiteConfigModel:
    def test_save_always_forces_singleton_pk(self):
        first = SiteConfig.objects.create(bg_padding_top=1)
        second = SiteConfig(bg_padding_top=2)
        second.save()

        assert first.pk == 1
        assert second.pk == 1
        assert SiteConfig.objects.count() == 1
        assert SiteConfig.objects.get(pk=1).bg_padding_top == 2
