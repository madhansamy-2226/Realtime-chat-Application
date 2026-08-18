from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer, 
    MessageSerializer, 
    CreateConversationSerializer
)

User = get_user_model()

class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            Q(user1=user) | Q(user2=user)
        ).order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        serializer = CreateConversationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        receiver_id = serializer.validated_data['receiver_id']
        receiver = get_object_or_404(User, id=receiver_id)
        
        conversation = Conversation.get_or_create_between(request.user, receiver)
        output_serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(user1=user) | Q(user2=user))


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None  # Return full chat history for conversation or paginated

    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_id')
        user = self.request.user
        # Ensure user belongs to this conversation
        conversation = get_object_or_404(Conversation, id=conversation_id)
        if conversation.user1 != user and conversation.user2 != user:
            return Message.objects.none()
        
        return Message.objects.filter(conversation=conversation).order_by('created_at')

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_id')
        user = self.request.user
        conversation = get_object_or_404(Conversation, id=conversation_id)
        if conversation.user1 != user and conversation.user2 != user:
            raise permissions.PermissionDenied("You are not part of this conversation.")
        
        msg = serializer.save(conversation=conversation, sender=user)
        conversation.save() # updates updated_at timestamp


class MessageDeleteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, message_id):
        message = get_object_or_404(Message, id=message_id, sender=request.user)
        message.is_deleted = True
        message.save()
        return Response({'message': 'Message marked as deleted', 'id': message.id}, status=status.HTTP_200_OK)


class MarkMessagesReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, conversation_id):
        user = request.user
        conversation = get_object_or_404(Conversation, id=conversation_id)
        if conversation.user1 != user and conversation.user2 != user:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        
        # Mark unread messages sent by the other user as read
        updated_count = Message.objects.filter(
            conversation=conversation,
            is_read=False
        ).exclude(sender=user).update(is_read=True)

        return Response({'marked_read': updated_count}, status=status.HTTP_200_OK)
