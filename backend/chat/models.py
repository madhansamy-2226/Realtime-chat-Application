from django.db import models
from django.conf import settings
from django.db.models import Q

class Conversation(models.Model):
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='conversations_initiated'
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='conversations_received'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        unique_together = ['user1', 'user2']

    def __str__(self):
        return f"Chat between {self.user1.username} and {self.user2.username}"

    def get_other_user(self, current_user):
        if self.user1_id == current_user.id:
            return self.user2
        return self.user1

    @classmethod
    def get_or_create_between(cls, user_a, user_b):
        if user_a.id == user_b.id:
            raise ValueError("Cannot create conversation with oneself.")
        
        # Consistent ordering or bi-directional lookup
        conversation = cls.objects.filter(
            (Q(user1=user_a) & Q(user2=user_b)) | 
            (Q(user1=user_b) & Q(user2=user_a))
        ).first()

        if not conversation:
            # Always store lower ID in user1 for canonical record
            u1, u2 = (user_a, user_b) if user_a.id < user_b.id else (user_b, user_a)
            conversation = cls.objects.create(user1=u1, user2=u2)
            
        return conversation


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_messages'
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        preview = (self.content[:25] + '..') if len(self.content) > 25 else self.content
        return f"{self.sender.username}: {preview} ({self.created_at})"
