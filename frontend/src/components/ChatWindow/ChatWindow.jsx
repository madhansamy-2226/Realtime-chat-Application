import React, { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import EmptyChat from './EmptyChat';
import { chatService } from '../../services/chatService';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const ChatWindow = ({ conversation, onBack, onStartChat }) => {
  const { user } = useAuth();
  const {
    sendChatMessage,
    deleteChatMessage,
    markConversationRead,
    joinConversationRoom,
    subscribeMessage,
    subscribeRead,
    subscribeDelete,
  } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load message history and join room when conversation changes
  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await chatService.getMessages(conversation.id);
        setMessages(data);
        // Inform backend and partner that messages are read
        markConversationRead(conversation.id);
        chatService.markAsRead(conversation.id).catch(() => {});
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };

    joinConversationRoom(conversation.id);
    fetchMessages();
  }, [conversation?.id]);

  // Real-time event listeners
  useEffect(() => {
    if (!conversation) return;

    const unsubMsg = subscribeMessage((newMsg, convId) => {
      if (Number(convId) === conversation.id) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        // If incoming from other user, automatically mark as read
        if (newMsg.sender?.id !== user?.id) {
          markConversationRead(conversation.id);
          chatService.markAsRead(conversation.id).catch(() => {});
        }
      }
    });

    const unsubRead = subscribeRead((convId, readerId) => {
      if (Number(convId) === conversation.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender?.id === user?.id ? { ...msg, is_read: true } : msg
          )
        );
      }
    });

    const unsubDel = subscribeDelete((msgId, convId) => {
      if (Number(convId) === conversation.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === msgId
              ? { ...msg, is_deleted: true, content: 'This message was deleted' }
              : msg
          )
        );
      }
    });

    return () => {
      unsubMsg();
      unsubRead();
      unsubDel();
    };
  }, [conversation?.id, user?.id, subscribeMessage, subscribeRead, subscribeDelete, markConversationRead]);

  const handleSendMessage = async (text) => {
    if (!conversation) return;

    // Try WebSocket send first
    const sent = sendChatMessage(conversation.id, text);
    if (!sent) {
      // Fallback REST API
      try {
        const fallbackMsg = await chatService.sendMessage(conversation.id, text);
        setMessages((prev) => [...prev, fallbackMsg]);
      } catch (e) {
        console.error('Failed to send fallback REST message:', e);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!conversation) return;
    deleteChatMessage(messageId, conversation.id);
    try {
      await chatService.deleteMessage(messageId);
    } catch (e) {
      console.error('Failed to delete message via REST:', e);
    }
  };

  if (!conversation) {
    return <EmptyChat onStartChat={onStartChat} />;
  }

  return (
    <main className="chat-window">
      <ChatHeader conversation={conversation} onBack={onBack} />
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Loading chat history...
        </div>
      ) : (
        <MessageList
          messages={messages}
          conversation={conversation}
          onDeleteMessage={handleDeleteMessage}
        />
      )}
      <MessageInput
        conversationId={conversation.id}
        onSendMessage={handleSendMessage}
      />
    </main>
  );
};

export default ChatWindow;
