from rest_framework import serializers
from .models import Transaction
from cards.models import Card

class TransactionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    target_card_id = serializers.PrimaryKeyRelatedField(
        queryset=Card.objects.all(),
        write_only=True
    )
    
    card = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'card', 'target_card_id', 'amount', 'merchant', 'location', 
            'transaction_type', 'status', 'timestamp', 'reference_id'
        ]
        read_only_fields = ['id', 'timestamp', 'status']

    def get_card(self, obj):
        return obj.card.id

    def validate_target_card_id(self, value):
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("Card does not belong to user.")
        return value

    def create(self, validated_data):
        card = validated_data.pop('target_card_id')
        validated_data['card'] = card
        return super().create(validated_data)
