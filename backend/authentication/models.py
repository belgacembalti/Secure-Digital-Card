from django.contrib.auth.models import AbstractUser
from django.db import models

from djongo import models as djongo_models
from bson import ObjectId

class User(AbstractUser):
    _id = djongo_models.ObjectIdField(default=ObjectId)
    id = None
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    two_factor_enabled = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
