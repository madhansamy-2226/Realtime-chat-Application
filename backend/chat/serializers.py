from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from users.serializers import UserMinimalSerializer

User = get_user_model()

class MessageSerializer(serializers.ModelSerializer):
    sender = UserMinimalSerializer(read_only=True)
    sender_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_id', 'content', 'is_read', 'is_deleted', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_read']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.is_deleted:
            data['content'] = 'This message was deleted'
        return data


class ConversationSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'other_user', 'last_message', 'unread_count', 'created_at', 'updated_at']

    def get_other_user(self, obj):
        request = self.context.get('request')
        current_user = getattr(request, 'user', None)
        if current_user and current_user.is_authenticated:
            other = obj.get_other_user(current_user)
            return UserMinimalSerializer(other).data
        return None

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        current_user = getattr(request, 'user', None)
        if current_user and current_user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=current_user).count()
        return 0


class CreateConversationSerializer(serializers.Serializer):
    receiver_id = serializers.IntegerField(required=True)

    def validate_receiver_id(self, value):
        request = self.context.get('request')
        if value == request.user.id:
            raise serializers.ValidationError("Cannot start a conversation with yourself.")
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("User does not exist.")
        return value
