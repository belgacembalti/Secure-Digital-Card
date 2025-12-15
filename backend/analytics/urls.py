from django.urls import path
from .views import AnalyticsView, DashboardSummaryView, SpendingTrendsView

urlpatterns = [
    path('stats/', AnalyticsView.as_view(), name='analytics_stats'),
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('trends/', SpendingTrendsView.as_view(), name='spending_trends'),
]
