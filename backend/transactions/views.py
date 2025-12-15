from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Transaction
from .serializers import TransactionSerializer
from cards.models import Card
import uuid

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'status', 'card']
    ordering_fields = ['timestamp', 'amount']

    def get_queryset(self):
        return Transaction.objects.filter(card__user=self.request.user)

    def perform_create(self, serializer):
        # Simulate payment processing logic here
        # In a real app, this would integrate with a payment gateway
        # For this demo, we auto-generate a reference ID
        reference_id = str(uuid.uuid4())
        serializer.save(reference_id=reference_id, status='COMPLETED')
