from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import base64
from django.core.files.base import ContentFile
import uuid

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_verified', 'two_factor_enabled', 'profile_picture')
        read_only_fields = ('is_verified',)

import logging

logger = logging.getLogger(__name__)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True, required=True)
    profile_picture = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'profile_picture')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            logger.error("Password validation failed: passwords do not match")
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        logger.info(f"Attempting to create user with email: {validated_data.get('email')} and username: {validated_data.get('username')}")
        validated_data.pop('password2')
        profile_picture_data = validated_data.pop('profile_picture', None)
        
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password']
            )
            
            if profile_picture_data:
                try:
                    # Handle both "data:image/jpeg;base64,..." and raw base64
                    if ';base64,' in profile_picture_data:
                        format, imgstr = profile_picture_data.split(';base64,') 
                        ext = format.split('/')[-1] 
                    else:
                        imgstr = profile_picture_data
                        ext = 'jpg' # default

                    data = base64.b64decode(imgstr) 
                    file_name = f"profile_{user.id}_{uuid.uuid4()}.{ext}"
                    user.profile_picture.save(file_name, ContentFile(data))
                    user.save()
                    logger.info(f"Saved profile picture for user {user.email}")
                except Exception as e:
                    logger.error(f"Failed to save profile picture: {e}")

            logger.info(f"User created successfully: {user.email} (ID: {user.id})")
            return user
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise e

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        # Ensure ID is a string for JWT claim
        token['user_id'] = str(user.id)
        return token

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
