from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView, UserProfileView, 
    LogoutView, ChangePasswordView, UploadProfilePictureView,
    FaceLoginView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='auth_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('upload-profile-picture/', UploadProfilePictureView.as_view(), name='upload_profile_picture'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('face-login/', FaceLoginView.as_view(), name='auth_face_login'),
]
