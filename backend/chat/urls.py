from django.urls import path
from .views import (
    ConversationListCreateView,
    ConversationDetailView,
    MessageListCreateView,
    MessageDeleteView,
    MarkMessagesReadView
)

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation_list_create'),
    path('conversations/<int:id>/', ConversationDetailView.as_view(), name='conversation_detail'),
    path('conversations/<int:conversation_id>/messages/', MessageListCreateView.as_view(), name='message_list_create'),
    path('conversations/<int:conversation_id>/read/', MarkMessagesReadView.as_view(), name='mark_messages_read'),
    path('messages/<int:message_id>/', MessageDeleteView.as_view(), name='message_delete'),
]
