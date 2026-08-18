from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    avatar_url = models.URLField(max_length=500, null=True, blank=True)
    bio = models.CharField(max_length=255, default="Hey there! I am using Real-Time Chat App.")
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    def get_avatar_display(self):
        if self.avatar:
            return self.avatar.url
        if self.avatar_url:
            return self.avatar_url
        # Fallback dynamic avatar
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={self.username}"
