from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import user_logged_in
from .utils import log_activity, track_device
from transactions.models import Transaction
from cards.models import Card

@receiver(user_logged_in)
def user_logged_in_callback(sender, request, user, **kwargs):
    track_device(user, request)
    log_activity(user, 'LOGIN', request, risk_score=10)

@receiver(post_save, sender=Transaction)
def transaction_created(sender, instance, created, **kwargs):
    if created:
        request = None # Cannot easily get request in signal without threadlocals or argument passing
        # Integration would use a service layer passing request context
        # For now, we skip request dependent fields or mock them
        pass

@receiver(post_save, sender=Card)
def card_action(sender, instance, created, **kwargs):
    action = 'ADD_CARD' if created else 'UPDATE_CARD'
    # Similarly, logging here ideally needs user context
    pass
