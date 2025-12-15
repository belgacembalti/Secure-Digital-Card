import requests
import uuid

BASE_URL = "http://127.0.0.1:8000/api"

def verify_upload():
    # Use EXISTING user
    email = "test_3f5d8ab9@example.com"
    password = "testpassword123"
    
    print(f"Logging in as: {email}")
    # Skip register, just login
    resp = requests.post(f"{BASE_URL}/auth/login/", data={"email": email, "password": password})
    if resp.status_code != 200:
        print("Login failed")
        return
        
    token = resp.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    
    # Upload
    print("Uploading image...")
    # Create dummy image
    files = {'profile_picture': ('test.jpg', b'fakeimagecontent', 'image/jpeg')}
    
    try:
        r = requests.post(f"{BASE_URL}/auth/upload-profile-picture/", headers=headers, files=files)
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print("Upload Failed")
            if "text/html" in r.headers.get("Content-Type", ""):
                 print(r.text[:1000]) # Print snippet
            else:
                 print(r.text)
        else:
            print("Upload Success")
            print(r.json())

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_upload()
