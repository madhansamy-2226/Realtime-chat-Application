import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingMap, setTypingMap] = useState({}); // { [conversationId]: { userId, username } }
  
  // Custom event listeners registry
  const listenersRef = useRef({
    onMessage: new Set(),
    onConversationUpdate: new Set(),
    onRead: new Set(),
    onDelete: new Set(),
  });

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_URL || '127.0.0.1:8000';
    const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/?token=${token}`;

    console.log('[WebSocket] Connecting to:', wsUrl);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[WebSocket] Connected successfully');
      setIsConnected(true);
    };

    socket.onclose = (event) => {
      console.log('[WebSocket] Disconnected:', event.code, event.reason);
      setIsConnected(false);
      // Auto-reconnect after 3s if still authenticated
      if (isAuthenticated) {
        setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    socket.onerror = (err) => {
      console.error('[WebSocket] Error:', err);
      socket.close();
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleIncomingEvent(data);
      } catch (e) {
        console.error('[WebSocket] Failed to parse message:', e);
      }
    };
  }, [isAuthenticated, user]);

  const handleIncomingEvent = (data) => {
    switch (data.type) {
      case 'new_message':
        listenersRef.current.onMessage.forEach((cb) => cb(data.message, data.conversation_id));
        break;

      case 'conversation_update':
        listenersRef.current.onConversationUpdate.forEach((cb) => cb(data.message, data.conversation_id));
        break;

      case 'user_typing':
        if (data.is_typing) {
          setTypingMap((prev) => ({
            ...prev,
            [data.conversation_id]: { userId: data.user_id, username: data.username },
          }));
        } else {
          setTypingMap((prev) => {
            const next = { ...prev };
            delete next[data.conversation_id];
            return next;
          });
        }
        break;

      case 'messages_read':
        listenersRef.current.onRead.forEach((cb) => cb(data.conversation_id, data.reader_id));
        break;

      case 'message_deleted':
        listenersRef.current.onDelete.forEach((cb) => cb(data.message_id, data.conversation_id));
        break;

      case 'presence_change':
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (data.is_online) {
            next.add(data.user_id);
          } else {
            next.delete(data.user_id);
          }
          return next;
        });
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isAuthenticated, connect]);

  // Outgoing WebSocket actions
  const sendChatMessage = (conversationId, messageText) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: 'chat_message',
          conversation_id: conversationId,
          message: messageText,
        })
      );
      return true;
    }
    return false;
  };

  const sendTypingStatus = (conversationId, isTyping) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: 'typing',
          conversation_id: conversationId,
          is_typing: isTyping,
        })
      );
    }
  };

  const markConversationRead = (conversationId) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: 'mark_read',
          conversation_id: conversationId,
        })
      );
    }
  };

  const deleteChatMessage = (messageId, conversationId) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: 'delete_message',
          message_id: messageId,
          conversation_id: conversationId,
        })
      );
    }
  };

  const joinConversationRoom = (conversationId) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: 'join_room',
          conversation_id: conversationId,
        })
      );
    }
  };

  // Subscription helpers for components
  const subscribeMessage = (callback) => {
    listenersRef.current.onMessage.add(callback);
    return () => listenersRef.current.onMessage.delete(callback);
  };

  const subscribeConversationUpdate = (callback) => {
    listenersRef.current.onConversationUpdate.add(callback);
    return () => listenersRef.current.onConversationUpdate.delete(callback);
  };

  const subscribeRead = (callback) => {
    listenersRef.current.onRead.add(callback);
    return () => listenersRef.current.onRead.delete(callback);
  };

  const subscribeDelete = (callback) => {
    listenersRef.current.onDelete.add(callback);
    return () => listenersRef.current.onDelete.delete(callback);
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        onlineUsers,
        typingMap,
        sendChatMessage,
        sendTypingStatus,
        markConversationRead,
        deleteChatMessage,
        joinConversationRoom,
        subscribeMessage,
        subscribeConversationUpdate,
        subscribeRead,
        subscribeDelete,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
