from rest_framework.test import APIClient
import pytest
@pytest.mark.django_db
class TestOrderCreation:
    def tests_order_created_200_success():
        # Arrange

        # Act
        client = APIClient()
        response = client.post('/store/orders/', {
            'customer': '1',
            'product': '1',
            'quantity': 1,
            'total_price': 100.00
        })

        # Assert
        assert response.status_code == 200

    def tests_order_created_400_failure():
        pass


