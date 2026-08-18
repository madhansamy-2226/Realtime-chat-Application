from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserMinimalSerializer(serializers.ModelSerializer):
    avatar_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar_display', 'bio', 'is_online', 'last_seen']

    def get_avatar_display(self, obj):
        return obj.get_avatar_display()


class UserProfileSerializer(serializers.ModelSerializer):
    avatar_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar', 'avatar_url', 'avatar_display', 'bio', 'is_online', 'last_seen', 'date_joined']
        read_only_fields = ['id', 'is_online', 'last_seen', 'date_joined']

    def get_avatar_display(self, obj):
        return obj.get_avatar_display()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password_confirm', 'bio', 'avatar_url']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Set default avatar_url if not provided
        if not validated_data.get('avatar_url'):
            username = validated_data.get('username')
            validated_data['avatar_url'] = f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}"

        user = User.objects.create_user(password=password, **validated_data)
        return user
