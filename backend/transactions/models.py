from django.db import models
from cards.models import Card

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('PAYMENT', 'Payment'),
        ('REFUND', 'Refund'),
        ('WITHDRAWAL', 'Withdrawal'),
    )

    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    merchant = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, default='PAYMENT')
    status = models.CharField(max_length=20, default='PENDING') # PENDING, COMPLETED, FAILED
    timestamp = models.DateTimeField(auto_now_add=True)
    reference_id = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.card.last_four}"
