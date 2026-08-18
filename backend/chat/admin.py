from django.contrib import admin
from .models import Conversation, Message

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user1', 'user2', 'updated_at', 'created_at')
    search_fields = ('user1__username', 'user2__username')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'content_preview', 'is_read', 'is_deleted', 'created_at')
    list_filter = ('is_read', 'is_deleted', 'created_at')
    search_fields = ('content', 'sender__username')

    def content_preview(self, obj):
        return obj.content[:30]
