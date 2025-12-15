from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Card
from .serializers import CardSerializer

class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Card.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def block(self, request, pk=None):
        card = self.get_object()
        card.is_blocked = True
        card.save()
        return Response({'status': 'card blocked'})

    @action(detail=True, methods=['post'])
    def unblock(self, request, pk=None):
        card = self.get_object()
        card.is_blocked = False
        card.save()
        return Response({'status': 'card unblocked'})
