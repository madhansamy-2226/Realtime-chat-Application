import React from 'react';
import { ArrowLeft, MoreVertical, Phone, Video, ShieldCheck } from 'lucide-react';
import Avatar from '../Common/Avatar';
import { useSocket } from '../../context/SocketContext';
import { format } from 'date-fns';

const ChatHeader = ({ conversation, onBack }) => {
  const { onlineUsers, typingMap } = useSocket();
  const otherUser = conversation?.other_user || {};
  const isOnline = onlineUsers.has(otherUser.id) || otherUser.is_online;
  const isTyping = typingMap[conversation?.id]?.userId === otherUser.id;

  const renderStatus = () => {
    if (isTyping) {
      return (
        <span style={{ color: 'var(--primary)', fontWeight: 600, fontStyle: 'italic' }}>
          typing...
        </span>
      );
    }
    if (isOnline) {
      return (
        <span style={{ color: 'var(--online)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--online)' }}></span> Online
        </span>
      );
    }
    if (otherUser.last_seen) {
      try {
        return `Last seen ${format(new Date(otherUser.last_seen), 'HH:mm')}`;
      } catch (e) {
        return 'Offline';
      }
    }
    return 'Offline';
  };

  return (
    <div className="chat-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
            }}
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <Avatar
          src={otherUser.avatar_display}
          alt={otherUser.username}
          isOnline={isOnline}
          size="md"
        />

        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)' }}>
            {otherUser.first_name ? `${otherUser.first_name} ${otherUser.last_name || ''}` : otherUser.username}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
            {renderStatus()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--text-muted)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: 'var(--text-subtle)',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px 10px',
            borderRadius: 999,
          }}
        >
          <ShieldCheck size={13} color="var(--primary)" /> Encrypted
        </div>

        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 6,
          }}
          title="More Options"
        >
          <MoreVertical size={19} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
