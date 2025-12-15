from django.db import models
from django.conf import settings
from .utils import encryption_manager

class Card(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cards')
    encrypted_number = models.CharField(max_length=255)
    encrypted_cvv = models.CharField(max_length=255)
    expiry_date = models.CharField(max_length=5) # MM/YY
    card_holder_name = models.CharField(max_length=100)
    
    is_active = models.BooleanField(default=True)
    is_blocked = models.BooleanField(default=False)
    daily_limit = models.DecimalField(max_digits=10, decimal_places=2, default=1000.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_number(self, raw_number):
        self.encrypted_number = encryption_manager.encrypt(raw_number)

    def get_number(self):
        return encryption_manager.decrypt(self.encrypted_number)

    def set_cvv(self, raw_cvv):
        self.encrypted_cvv = encryption_manager.encrypt(raw_cvv)
    
    def get_cvv(self):
        return encryption_manager.decrypt(self.encrypted_cvv)

    @property
    def last_four(self):
        decrypted = self.get_number()
        return decrypted[-4:] if decrypted else "****"

    def __str__(self):
        return f"{self.user.email} - ....{self.last_four}"
