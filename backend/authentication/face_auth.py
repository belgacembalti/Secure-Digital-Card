from deepface import DeepFace
import os
import cv2
import numpy as np
import base64
from django.conf import settings
from django.core.files.base import ContentFile

class FaceAuth:
    @staticmethod
    def verify_face(image_data):
        """
        Verifies a face image against the database of profile pictures.
        Args:
            image_data: Base64 encoded image string or file object
        Returns:
            matched_image_path (str) or None
        """
        try:
            # Save temporary file for processing
            temp_filename = "temp_login_face.jpg"
            temp_path = os.path.join(settings.MEDIA_ROOT, temp_filename)
            
            # Handle Base64 input
            if isinstance(image_data, str) and image_data.startswith('data:image'):
                format, imgstr = image_data.split(';base64,') 
                ext = format.split('/')[-1] 
                data = base64.b64decode(imgstr)
                with open(temp_path, "wb") as f:
                    f.write(data)
            else:
                 # Assume it's a file object or raw bytes (not implemented for simplicity of this snippet, can extend)
                 # For now, expect base64 string from frontend
                 return None

            db_path = os.path.join(settings.MEDIA_ROOT, 'profile_pictures')
            
            # Check if db_path exists and has images
            if not os.path.exists(db_path) or not os.listdir(db_path):
                return None

            # DeepFace.find
            # model_name options: VGG-Face, Facenet, Facenet512, OpenFace, DeepFace, DeepID, ArcFace, Dlib, SFace, GhostFaceV1
            # metric options: cosine, euclidean, euclidean_l2
            results = DeepFace.find(img_path=temp_path, db_path=db_path, model_name="VGG-Face", enforce_detection=False, silent=True)
            
            # Cleanup temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)

            if results and len(results) > 0:
                df = results[0]
                if not df.empty:
                    # Get the identity (path to the matched image)
                    matched_path = df.iloc[0]['identity']
                    return matched_path
            
            return None

        except Exception as e:
            print(f"Face recognition error: {e}")
            # Cleanup in case of error
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return None
