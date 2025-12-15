import requests

BASE_URL = "http://127.0.0.1:8000/api"

def verify_full_flow():
    email = "test_3f5d8ab9@example.com"
    password = "testpassword123"
    
    print(f"Logging in...")
    resp = requests.post(f"{BASE_URL}/auth/login/", data={"email": email, "password": password})
    token = resp.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Adding Card...")
    card_data = {
        "card_holder_name": "Test User",
        "card_number": "1234567812345678",
        "cvv": "123",
        "expiry_date": "12/28"
    }
    r = requests.post(f"{BASE_URL}/cards/", headers=headers, json=card_data)
    if r.status_code == 201:
        print("Card Added.")
    else:
        print(f"Card Add Failed: {r.status_code} {r.text}")
        return

    print("Checking Dashboard (Cards)...")
    r = requests.get(f"{BASE_URL}/cards/", headers=headers)
    if r.status_code == 200:
        print("Dashboard Cards Success.")
        print(r.json())
        print("Success! fixed key works.")
    else:
        print(f"Dashboard Failed: {r.status_code} {r.text[:500]}")

if __name__ == "__main__":
    verify_full_flow()
