import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

def verify():
    print("Attempting to import DeepFace...")
    try:
        from deepface import DeepFace
        print("DeepFace imported successfully!")
    except ImportError as e:
        print(f"Failed to import DeepFace: {e}")
        print("Please ensure dependencies are installed via 'pip install deepface tf-keras opencv-python'")
        return

    media_root = os.path.join(os.getcwd(), 'media')
    profile_pics = os.path.join(media_root, 'profile_pictures')

    if not os.path.exists(profile_pics):
        print(f"Profile pictures directory not found at: {profile_pics}")
        # Create it just in case
        os.makedirs(profile_pics, exist_ok=True)
        print("Created directory.")
        return

    files = [f for f in os.listdir(profile_pics) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    if not files:
        print("No profile pictures found in media/profile_pictures. Upload a photo first to test recognition.")
        return

    test_img = os.path.join(profile_pics, files[0])
    print(f"Testing recognition with existing image: {test_img}")

    try:
        # We use the same image to search for itself (should match)
        results = DeepFace.find(
            img_path=test_img, 
            db_path=profile_pics, 
            model_name="VGG-Face", 
            enforce_detection=False,
            silent=True
        )
        
        if results and len(results) > 0 and not results[0].empty:
            print("SUCCESS: Face recognition found matches!")
            print(results[0])
        else:
            print("WARNING: Face recognition ran but found no matches (unexpected for self-match).")
            
    except Exception as e:
        import traceback
        error_msg = f"ERROR during DeepFace.find: {e}\n{traceback.format_exc()}"
        print(error_msg)
        with open("verify_error.log", "w") as f:
            f.write(error_msg)

if __name__ == "__main__":
    verify()
