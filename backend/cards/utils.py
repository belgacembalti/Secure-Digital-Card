from cryptography.fernet import Fernet
import os
import base64

class EncryptionManager:
    def __init__(self):
        # In prod, this should be loaded securely. For now, we generate or use env.
        key = os.environ.get('ENCRYPTION_KEY')
        if not key:
        # Fallback for dev only. In prod this must be set!
            # key = Fernet.generate_key().decode() 
            key = "ChangeMeInProductionKey12345678901234567890=" # Must be 32 url-safe base64-encoded bytes
            # Actually, Fernet key must be 32 bytes valid base64. 
            # Let's use a valid one -> Fernet.generate_key() output
            key = "lB1bzWap9ePm5_PaY4zbKw_Lb_L6OsVxJx4Le7igZQ0=" 
            print(f"WARNING: No ENCRYPTION_KEY set. Using fixed dev key.")
        self.fernet = Fernet(key.encode() if isinstance(key, str) else key)

    def encrypt(self, data):
        if not data:
            return None
        return self.fernet.encrypt(data.encode()).decode()

    def decrypt(self, data):
        if not data:
            return None
        return self.fernet.decrypt(data.encode()).decode()

encryption_manager = EncryptionManager()
