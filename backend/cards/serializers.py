from rest_framework import serializers
from .models import Card

class CardSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    card_number = serializers.CharField(write_only=True)
    cvv = serializers.CharField(write_only=True)
    masked_number = serializers.CharField(source='last_four', read_only=True)

    class Meta:
        model = Card
        fields = [
            'id', 'card_holder_name', 'card_number', 'cvv', 'expiry_date',
            'masked_number', 'daily_limit', 'is_active', 'is_blocked', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['is_active', 'is_blocked', 'created_at', 'updated_at', 'id']

    def create(self, validated_data):
        card_number = validated_data.pop('card_number')
        cvv = validated_data.pop('cvv')
        user = self.context['request'].user
        
        card = Card(user=user, **validated_data)
        card.set_number(card_number)
        card.set_cvv(cvv)
        card.save()
        return card

    def update(self, instance, validated_data):
        # Prevent updating critical sensitive fields directly via this serializer if not intended
        # usually update is for limits or status
        if 'card_number' in validated_data or 'cvv' in validated_data:
             raise serializers.ValidationError("Cannot update card number or CVV directly.")
        return super().update(instance, validated_data)
