from django.db import models
from django.conf import settings

class Device(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='devices')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    os = models.CharField(max_length=50, blank=True)
    browser = models.CharField(max_length=50, blank=True)
    last_login = models.DateTimeField(auto_now=True)
    is_trusted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user} - {self.ip_address} on {self.os}"

class AuditLog(models.Model):
    ACTION_CHOICES = (
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('ADD_CARD', 'Add Card'),
        ('DELETE_CARD', 'Delete Card'),
        ('BLOCK_CARD', 'Block Card'),
        ('TRANSACTION', 'Transaction Made'),
        ('LIMIT_CHANGE', 'Limit Changed'),
        ('FAILED_LOGIN', 'Failed Login'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)
    risk_score = models.IntegerField(default=0) # 0 to 100

    def __str__(self):
        return f"{self.action} by {self.user} at {self.timestamp}"
