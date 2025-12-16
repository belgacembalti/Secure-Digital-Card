from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer, ChangePasswordSerializer
from .face_auth import FaceAuth
from rest_framework_simplejwt.tokens import RefreshToken
import os

User = get_user_model()

import logging

logger = logging.getLogger(__name__)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]  # Use list format for proper override
    authentication_classes = []  # Disable authentication for registration
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        logger.info(f"RegisterView received POST data: {request.data}")
        return super().post(request, *args, **kwargs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated login attempts
    authentication_classes = []  # Disable authentication for login endpoint

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UploadProfilePictureView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'profile_picture' not in request.FILES:
            return Response(
                {"error": "No profile picture provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        profile_picture = request.FILES['profile_picture']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if profile_picture.content_type not in allowed_types:
            return Response(
                {"error": "Invalid file type. Only JPEG, PNG, and GIF are allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 5MB)
        if profile_picture.size > 5 * 1024 * 1024:
            return Response(
                {"error": "File too large. Maximum size is 5MB."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete old profile picture if exists
        if user.profile_picture:
            user.profile_picture.delete(save=False)
        
        # Save new profile picture
        user.profile_picture = profile_picture
        user.save()
        
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class LogoutView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        # With stateless JWT, client just discards token. 
        # But we can implement blacklist here if needed.
        return Response(status=status.HTTP_205_RESET_CONTENT)

class FaceLoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        image_data = request.data.get('image')
        if not image_data:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        matched_path = FaceAuth.verify_face(image_data)
        
        if matched_path:
            try:
                # matched_path is likely absolute. Get filename
                filename = os.path.basename(matched_path)
                
                # Find user with this profile picture
                # Django stores path relative to MEDIA_ROOT
                # detailed match: filter where path ends with filename
                user = User.objects.filter(profile_picture__icontains=filename).first()
                
                if user:
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': UserSerializer(user).data
                    }, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Error finding user for face: {e}")
                pass
        
        return Response({"error": "Face not recognized"}, status=status.HTTP_401_UNAUTHORIZED)
