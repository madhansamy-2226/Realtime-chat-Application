import React, { useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const formatDateHeader = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  } catch (e) {
    return '';
  }
};

const MessageList = ({ messages, conversation, onDeleteMessage }) => {
  const { user } = useAuth();
  const { typingMap } = useSocket();
  const messagesEndRef = useRef(null);

  const isPartnerTyping = typingMap[conversation?.id]?.userId === conversation?.other_user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping]);

  // Group messages by date
  const groupedMessages = [];
  let currentDate = null;

  messages.forEach((msg) => {
    const msgDate = format(new Date(msg.created_at || Date.now()), 'yyyy-MM-dd');
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({
        type: 'date_header',
        date: msg.created_at,
        id: `date_${msgDate}`,
      });
    }
    groupedMessages.push({
      type: 'message',
      ...msg,
    });
  });

  return (
    <div className="chat-messages-container">
      {groupedMessages.map((item) => {
        if (item.type === 'date_header') {
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '12px 0',
              }}
            >
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  padding: '4px 14px',
                  borderRadius: 999,
                  fontSize: 11,
                  color: 'var(--text-subtle)',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                }}
              >
                {formatDateHeader(item.date)}
              </span>
            </div>
          );
        }

        const isMe = item.sender?.id === user?.id || item.sender_id === user?.id;

        return (
          <div
            key={item.id}
            className={`message-row ${isMe ? 'outgoing' : 'incoming'}`}
          >
            <div className="message-bubble">
              {/* Delete button on hover for own undeleted messages */}
              {isMe && !item.is_deleted && (
                <button
                  className="message-delete-btn"
                  onClick={() => onDeleteMessage(item.id)}
                  title="Delete message"
                >
                  <Trash2 size={12} />
                </button>
              )}

              <div className={item.is_deleted ? 'message-deleted' : ''}>
                {item.content}
              </div>

              <div className="message-meta">
                <span>
                  {item.created_at ? format(new Date(item.created_at), 'HH:mm') : ''}
                </span>

                {isMe && (
                  <span>
                    {item.is_read ? (
                      <CheckCheck size={14} color="#38bdf8" />
                    ) : (
                      <Check size={14} color="rgba(255, 255, 255, 0.6)" />
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {isPartnerTyping && (
        <div className="typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
