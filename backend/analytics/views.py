from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from cards.models import Card
from transactions.models import Transaction
import decimal


class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get analytics data for the authenticated user
        Query params:
        - period: 'week', 'month', 'year' (default: 'month')
        """
        period = request.query_params.get('period', 'month')
        user = request.user

        # Get user's cards
        user_cards = Card.objects.filter(user=user)
        
        # Calculate date range
        now = timezone.now()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:  # month
            start_date = now - timedelta(days=30)

        # Get transactions in period
        transactions = Transaction.objects.filter(
            card__user=user,
            timestamp__gte=start_date
        )

        # Calculate statistics
        total_spent = transactions.aggregate(
            total=Sum('amount')
        )['total'] or decimal.Decimal('0.00')

        transaction_count = transactions.count()
        
        avg_transaction = transactions.aggregate(
            avg=Avg('amount')
        )['avg'] or decimal.Decimal('0.00')

        # Top merchants
        top_merchants = transactions.values('merchant').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')[:5]

        # Transaction breakdown by type
        transaction_types = transactions.values('transaction_type').annotate(
            count=Count('id'),
            total=Sum('amount')
        )

        # Card usage statistics
        card_stats = []
        for card in user_cards:
            card_transactions = transactions.filter(card=card)
            card_stats.append({
                'card_id': card.id,
                'last_four': card.last_four,
                'card_holder_name': card.card_holder_name,
                'is_blocked': card.is_blocked,
                'transaction_count': card_transactions.count(),
                'total_spent': float(card_transactions.aggregate(total=Sum('amount'))['total'] or 0)
            })

        return Response({
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': now.isoformat(),
            'summary': {
                'total_spent': float(total_spent),
                'transaction_count': transaction_count,
                'average_transaction': float(avg_transaction),
                'active_cards': user_cards.filter(is_blocked=False).count(),
                'total_cards': user_cards.count(),
            },
            'top_merchants': list(top_merchants),
            'transaction_types': list(transaction_types),
            'card_stats': card_stats,
        }, status=status.HTTP_200_OK)


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get dashboard summary data for quick overview
        """
        user = request.user

        # Get user's cards
        cards = Card.objects.filter(user=user)
        
        # Recent transactions (last 5)
        recent_transactions = Transaction.objects.filter(
            card__user=user
        ).order_by('-timestamp')[:5]

        # This month's spending
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        monthly_spending = Transaction.objects.filter(
            card__user=user,
            timestamp__gte=month_start
        ).aggregate(
            total=Sum('amount'),
            count=Count('id')
        )

        return Response({
            'cards': {
                'total': cards.count(),
                'active': cards.filter(is_blocked=False).count(),
                'blocked': cards.filter(is_blocked=True).count(),
            },
            'monthly_spending': {
                'total': float(monthly_spending['total'] or 0),
                'transaction_count': monthly_spending['count'],
            },
            'recent_activity': recent_transactions.count(),
        }, status=status.HTTP_200_OK)


class SpendingTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get spending trends over time
        Returns data for charting
        """
        user = request.user
        period = request.query_params.get('period', 'month')

        now = timezone.now()
        
        # Calculate periods
        if period == 'week':
            days = 7
            date_format = '%Y-%m-%d'
        elif period == 'year':
            days = 365
            date_format = '%Y-%m'
        else:  # month
            days = 30
            date_format = '%Y-%m-%d'

        start_date = now - timedelta(days=days)

        # Get all transactions in period
        transactions = Transaction.objects.filter(
            card__user=user,
            timestamp__gte=start_date
        ).order_by('timestamp')

        # Group by date and calculate totals
        trends = {}
        for tx in transactions:
            date_key = tx.timestamp.strftime(date_format)
            if date_key not in trends:
                trends[date_key] = {
                    'date': date_key,
                    'total': 0,
                    'count': 0
                }
            trends[date_key]['total'] += float(tx.amount)
            trends[date_key]['count'] += 1

        return Response({
            'period': period,
            'trends': list(trends.values()),
        }, status=status.HTTP_200_OK)
