"""
Script de test pour vérifier le rate limiting.
Usage: python test_rate_limit.py
"""
import requests
import time

BASE_URL = "http://localhost:8000"

def test_payment_rate_limit():
    """
    Teste le rate limit sur create-stripe-session (10/hour)
    """
    print("=== Test Payment Rate Limit (10/hour) ===")

    url = f"{BASE_URL}/store/create-stripe-session/"
    payload = {
        "items": [{"product_id": 1, "quantity": 1}],
        "customer": {
            "email": "test@test.com",
            "firstName": "Test",
            "lastName": "User",
            "phone": "0123456789",
            "address": "123 Test St",
            "city": "Paris",
            "postalCode": "75001",
            "country": "France"
        }
    }

    for i in range(12):
        response = requests.post(url, json=payload)
        print(f"Request {i+1}: Status {response.status_code}")

        if response.status_code == 429:
            print(f"✅ Rate limit atteint à la requête #{i+1}")
            print(f"   Response: {response.json()}")
            return

        time.sleep(0.5)

    print("❌ Rate limit non atteint après 12 requêtes")


def test_burst_rate_limit():
    """
    Teste le burst rate limit (20/minute)
    """
    print("\n=== Test Burst Rate Limit (20/minute) ===")

    url = f"{BASE_URL}/store/products/"

    for i in range(25):
        response = requests.get(url)
        print(f"Request {i+1}: Status {response.status_code}")

        if response.status_code == 429:
            print(f"✅ Burst limit atteint à la requête #{i+1}")
            print(f"   Response: {response.json()}")
            return

    print("❌ Burst limit non atteint après 25 requêtes")


if __name__ == "__main__":
    print("Assurez-vous que le serveur Django tourne sur http://localhost:8000\n")

    # Test 1: Payment rate limit (strict)
    test_payment_rate_limit()

    # Test 2: Burst protection
    # test_burst_rate_limit()  # Décommenter pour tester le burst
