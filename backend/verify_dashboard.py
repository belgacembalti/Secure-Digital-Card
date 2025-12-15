import requests

BASE_URL = "http://127.0.0.1:8000/api"

def verify_dashboard():
    # Use EXISTING user
    email = "test_3f5d8ab9@example.com"
    password = "testpassword123"
    
    print(f"Logging in as: {email}")
    resp = requests.post(f"{BASE_URL}/auth/login/", data={"email": email, "password": password})
    if resp.status_code != 200:
        print("Login failed")
        print(resp.text)
        return
        
    token = resp.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Checking /cards/ endpoint...")
    try:
        r = requests.get(f"{BASE_URL}/cards/", headers=headers)
        print(f"Cards Status: {r.status_code}")
        if r.status_code != 200:
            print("Cards Failed")
            if "text/html" in r.headers.get("Content-Type", ""):
                 print(r.text[:2000]) 
            else:
                 print(r.text)
        else:
            print("Cards Success")
            print(r.json())
    except Exception as e:
        print(f"Cards Error: {e}")

    print("Checking /transactions/ endpoint...")
    try:
        r = requests.get(f"{BASE_URL}/transactions/", headers=headers)
        print(f"Transactions Status: {r.status_code}")
        if r.status_code != 200:
            print("Transactions Failed")
            if "text/html" in r.headers.get("Content-Type", ""):
                 print(r.text[:2000]) 
            else:
                 print(r.text)
        else:
            print("Transactions Success")
            print(r.json())
    except Exception as e:
        print(f"Transactions Error: {e}")

if __name__ == "__main__":
    verify_dashboard()
