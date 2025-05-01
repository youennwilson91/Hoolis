import pytest
from django.urls import reverse

@pytest.mark.django_db
def test_django_setup():
    """Simple test to verify pytest-django is working."""
    assert True 