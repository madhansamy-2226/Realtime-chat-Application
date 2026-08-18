import React, { useState, useEffect } from 'react';
import { Search, X, MessageSquarePlus, Loader2 } from 'lucide-react';
import { chatService } from '../../services/chatService';
import Avatar from '../Common/Avatar';
import { useSocket } from '../../context/SocketContext';

const UserSearchModal = ({ isOpen, onClose, onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { onlineUsers } = useSocket();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await chatService.searchUsers(query);
        setUsers(results);
      } catch (err) {
        console.error('User search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquarePlus size={20} color="var(--primary)" />
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Start New Chat</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="input-with-icon" style={{ marginBottom: 18 }}>
          <Search size={18} className="input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by username or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24, color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)', fontSize: 14 }}>
              {query ? 'No users found.' : 'Type a name or username to find contacts.'}
            </div>
          ) : (
            users.map((u) => {
              const isOnline = onlineUsers.has(u.id) || u.is_online;
              return (
                <div
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                >
                  <Avatar src={u.avatar_display} alt={u.username} isOnline={isOnline} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-main)' }}>
                      {u.username}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {u.bio || u.email}
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '6px 14px', fontSize: 12, borderRadius: 999 }}
                  >
                    Chat
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
