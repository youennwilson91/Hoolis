from django.test import TestCase
import pytest
from django.urls import reverse

# Create your tests here.

@pytest.mark.django_db
def test_django_setup():
    """Simple test to verify pytest-django is working."""
    assert True
