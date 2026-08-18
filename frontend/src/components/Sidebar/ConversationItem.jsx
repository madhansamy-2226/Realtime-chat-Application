import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import Avatar from '../Common/Avatar';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'dd/MM/yy');
  } catch (e) {
    return '';
  }
};

const ConversationItem = ({ conversation, isActive, onClick }) => {
  const { user: currentUser } = useAuth();
  const { onlineUsers, typingMap } = useSocket();

  const otherUser = conversation.other_user || {};
  const isOnline = onlineUsers.has(otherUser.id) || otherUser.is_online;
  const isTyping = typingMap[conversation.id]?.userId === otherUser.id;

  const lastMessage = conversation.last_message;
  let lastMessageText = 'No messages yet';
  let isSenderMe = false;

  if (lastMessage) {
    isSenderMe = lastMessage.sender?.id === currentUser?.id;
    if (lastMessage.is_deleted) {
      lastMessageText = 'This message was deleted';
    } else {
      lastMessageText = lastMessage.content;
    }
  }

  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <Avatar
        src={otherUser.avatar_display}
        alt={otherUser.username}
        isOnline={isOnline}
        size="md"
      />

      <div className="conversation-info">
        <div className="conversation-top">
          <span className="conversation-name">
            {otherUser.first_name ? `${otherUser.first_name} ${otherUser.last_name || ''}` : otherUser.username}
          </span>
          <span className="conversation-time">
            {formatMessageTime(lastMessage?.created_at || conversation.updated_at)}
          </span>
        </div>

        <div className="conversation-bottom">
          <span className="conversation-last-message" style={isTyping ? { color: 'var(--primary)', fontStyle: 'italic', fontWeight: 500 } : {}}>
            {isTyping ? (
              'typing...'
            ) : (
              <>
                {isSenderMe && <span style={{ color: 'var(--text-subtle)' }}>You: </span>}
                {lastMessageText}
              </>
            )}
          </span>

          {conversation.unread_count > 0 && !isActive && (
            <span className="unread-badge">{conversation.unread_count}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
