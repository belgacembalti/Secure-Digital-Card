from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet, DeviceViewSet

router = DefaultRouter()
router.register(r'logs', AuditLogViewSet, basename='auditlog')
router.register(r'devices', DeviceViewSet, basename='device')

urlpatterns = [
    path('', include(router.urls)),
]
