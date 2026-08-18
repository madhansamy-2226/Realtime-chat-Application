import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Conversation, Message
from .serializers import MessageSerializer

User = get_user_model()

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')

        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        self.user_group_name = f"user_{self.user.id}"
        
        # Join personal user group (for notifications across any chat)
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        # Join global presence group (for real-time online status indicators)
        await self.channel_layer.group_add(
            "global_presence",
            self.channel_name
        )

        # Get conversation_id from URL if present
        self.conversation_id = self.scope['url_route']['kwargs'].get('conversation_id')
        if self.conversation_id:
            self.chat_room_name = f"chat_{self.conversation_id}"
            await self.channel_layer.group_add(
                self.chat_room_name,
                self.channel_name
            )

        # Mark user as online in database & broadcast status
        await self.update_user_status(is_online=True)
        await self.broadcast_presence(is_online=True)

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'user') and self.user.is_authenticated:
            # Leave personal user group
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

            # Leave global presence group
            await self.channel_layer.group_discard(
                "global_presence",
                self.channel_name
            )

            # Leave chat room if was in one
            if hasattr(self, 'chat_room_name'):
                await self.channel_layer.group_discard(
                    self.chat_room_name,
                    self.channel_name
                )

            # Mark user as offline in database & broadcast status
            await self.update_user_status(is_online=False)
            await self.broadcast_presence(is_online=False)

    async def receive_json(self, content):
        """
        Handle incoming messages from client WebSocket:
        - chat_message: send new message
        - typing: notify partner that user is typing
        - mark_read: mark messages as read
        - delete_message: delete specific message
        - join_room: switch active room without reconnecting
        """
        action = content.get('action')

        if action == 'chat_message':
            conversation_id = content.get('conversation_id') or self.conversation_id
            message_text = content.get('message', '').strip()

            if not conversation_id or not message_text:
                return

            # Save message to database
            msg_data, receiver_id = await self.save_message(conversation_id, message_text)
            if not msg_data:
                return

            room_name = f"chat_{conversation_id}"

            # Broadcast message to conversation room
            await self.channel_layer.group_send(
                room_name,
                {
                    'type': 'chat_message_broadcast',
                    'message': msg_data,
                    'conversation_id': conversation_id,
                }
            )

            # Also notify receiver's personal group if they are outside the room (updates conversation list badge)
            if receiver_id:
                await self.channel_layer.group_send(
                    f"user_{receiver_id}",
                    {
                        'type': 'notification_broadcast',
                        'message': msg_data,
                        'conversation_id': conversation_id,
                    }
                )

        elif action == 'typing':
            conversation_id = content.get('conversation_id') or self.conversation_id
            is_typing = content.get('is_typing', False)

            if conversation_id:
                await self.channel_layer.group_send(
                    f"chat_{conversation_id}",
                    {
                        'type': 'typing_broadcast',
                        'user_id': self.user.id,
                        'username': self.user.username,
                        'is_typing': is_typing,
                        'conversation_id': conversation_id
                    }
                )

        elif action == 'mark_read':
            conversation_id = content.get('conversation_id') or self.conversation_id
            if conversation_id:
                count = await self.mark_messages_as_read(conversation_id)
                if count > 0:
                    await self.channel_layer.group_send(
                        f"chat_{conversation_id}",
                        {
                            'type': 'messages_read_broadcast',
                            'conversation_id': conversation_id,
                            'reader_id': self.user.id
                        }
                    )

        elif action == 'delete_message':
            message_id = content.get('message_id')
            conversation_id = content.get('conversation_id') or self.conversation_id
            if message_id and conversation_id:
                success = await self.delete_own_message(message_id)
                if success:
                    await self.channel_layer.group_send(
                        f"chat_{conversation_id}",
                        {
                            'type': 'message_deleted_broadcast',
                            'message_id': message_id,
                            'conversation_id': conversation_id
                        }
                    )

        elif action == 'join_room':
            new_conversation_id = content.get('conversation_id')
            if new_conversation_id:
                # Leave old room if existing
                if hasattr(self, 'chat_room_name') and self.chat_room_name:
                    await self.channel_layer.group_discard(
                        self.chat_room_name,
                        self.channel_name
                    )
                self.conversation_id = new_conversation_id
                self.chat_room_name = f"chat_{new_conversation_id}"
                await self.channel_layer.group_add(
                    self.chat_room_name,
                    self.channel_name
                )

    # Handlers for messages broadcast from Channel Layer
    async def chat_message_broadcast(self, event):
        await self.send_json({
            'type': 'new_message',
            'message': event['message'],
            'conversation_id': event['conversation_id'],
        })

    async def notification_broadcast(self, event):
        await self.send_json({
            'type': 'conversation_update',
            'message': event['message'],
            'conversation_id': event['conversation_id'],
        })

    async def typing_broadcast(self, event):
        # Do not echo typing state back to the person typing
        if event['user_id'] != self.user.id:
            await self.send_json({
                'type': 'user_typing',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing'],
                'conversation_id': event['conversation_id'],
            })

    async def messages_read_broadcast(self, event):
        await self.send_json({
            'type': 'messages_read',
            'conversation_id': event['conversation_id'],
            'reader_id': event['reader_id']
        })

    async def message_deleted_broadcast(self, event):
        await self.send_json({
            'type': 'message_deleted',
            'message_id': event['message_id'],
            'conversation_id': event['conversation_id']
        })

    async def presence_broadcast(self, event):
        # Broadcast presence change to client
        await self.send_json({
            'type': 'presence_change',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_online': event['is_online'],
            'last_seen': event['last_seen'],
        })

    async def broadcast_presence(self, is_online):
        await self.channel_layer.group_send(
            "global_presence",
            {
                'type': 'presence_broadcast',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_online': is_online,
                'last_seen': timezone.now().isoformat(),
            }
        )

    # Database Helpers
    @database_sync_to_async
    def update_user_status(self, is_online):
        try:
            User.objects.filter(id=self.user.id).update(
                is_online=is_online,
                last_seen=timezone.now()
            )
        except Exception:
            pass

    @database_sync_to_async
    def save_message(self, conversation_id, content):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            # Verify user belongs to conversation
            if conversation.user1_id != self.user.id and conversation.user2_id != self.user.id:
                return None, None

            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=content
            )
            conversation.save() # update conversation updated_at

            receiver = conversation.user2 if conversation.user1_id == self.user.id else conversation.user1
            return MessageSerializer(message).data, receiver.id
        except Exception as e:
            return None, None

    @database_sync_to_async
    def mark_messages_as_read(self, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            if conversation.user1_id != self.user.id and conversation.user2_id != self.user.id:
                return 0
            
            return Message.objects.filter(
                conversation=conversation,
                is_read=False
            ).exclude(sender=self.user).update(is_read=True)
        except Exception:
            return 0

    @database_sync_to_async
    def delete_own_message(self, message_id):
        try:
            msg = Message.objects.get(id=message_id, sender=self.user)
            msg.is_deleted = True
            msg.save()
            return True
        except Exception:
            return False
