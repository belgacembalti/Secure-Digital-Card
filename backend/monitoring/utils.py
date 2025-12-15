from .models import AuditLog, Device
from django.utils.deprecation import MiddlewareMixin
from user_agents import parse

class ActivityMonitorMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if hasattr(request, 'user') and request.user.is_authenticated:
            # We only automatically log highly critical actions here if needed
            # Or updates Device info on every request
            # For this demo, let's update device info on login endpoints only ideally
            # But let's tracking generic presence here
            pass
        return response

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def log_activity(user, action, request, details=None, risk_score=0):
    if not details:
        details = {}
    
    ip = get_client_ip(request)
    
    AuditLog.objects.create(
        user=user,
        action=action,
        ip_address=ip,
        details=details,
        risk_score=risk_score
    )

def track_device(user, request):
    ip = get_client_ip(request)
    ua_string = request.META.get('HTTP_USER_AGENT', '')
    user_agent = parse(ua_string)
    
    device, created = Device.objects.get_or_create(
        user=user,
        ip_address=ip,
        user_agent=ua_string,
        defaults={
            'os': user_agent.os.family,
            'browser': user_agent.browser.family
        }
    )
    if not created:
        device.last_login = models.DateTimeField.now() # Update functionality needs import
        device.save()
