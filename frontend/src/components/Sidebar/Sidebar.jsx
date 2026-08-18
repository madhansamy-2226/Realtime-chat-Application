import React, { useState, useEffect } from 'react';
import { Search, Plus, LogOut, Settings, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services/chatService';
import ConversationItem from './ConversationItem';
import UserSearchModal from './UserSearchModal';
import ProfileModal from '../Common/ProfileModal';
import Avatar from '../Common/Avatar';

const Sidebar = ({ activeConversation, onSelectConversation, isMobileHidden }) => {
  const { user, logout } = useAuth();
  const { subscribeMessage, subscribeConversationUpdate, subscribeRead } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fetchConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Real-time update listeners
  useEffect(() => {
    const unsubMsg = subscribeMessage((newMsg, convId) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === Number(convId));
        if (index !== -1) {
          const updated = [...prev];
          const conv = { ...updated[index] };
          conv.last_message = newMsg;
          conv.updated_at = newMsg.created_at;
          if (activeConversation?.id !== Number(convId) && newMsg.sender?.id !== user?.id) {
            conv.unread_count = (conv.unread_count || 0) + 1;
          }
          updated.splice(index, 1);
          updated.unshift(conv);
          return updated;
        } else {
          // If conversation wasn't in list yet, reload all
          fetchConversations();
          return prev;
        }
      });
    });

    const unsubUpdate = subscribeConversationUpdate((msg, convId) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === Number(convId));
        if (index !== -1) {
          const updated = [...prev];
          const conv = { ...updated[index] };
          conv.last_message = msg;
          conv.updated_at = msg.created_at;
          if (activeConversation?.id !== Number(convId) && msg.sender?.id !== user?.id) {
            conv.unread_count = (conv.unread_count || 0) + 1;
          }
          updated.splice(index, 1);
          updated.unshift(conv);
          return updated;
        } else {
          fetchConversations();
          return prev;
        }
      });
    });

    const unsubRead = subscribeRead((convId) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === Number(convId) ? { ...c, unread_count: 0 } : c))
      );
    });

    return () => {
      unsubMsg();
      unsubUpdate();
      unsubRead();
    };
  }, [activeConversation, user, subscribeMessage, subscribeConversationUpdate, subscribeRead]);

  const handleStartChatWithUser = async (targetUser) => {
    try {
      const conv = await chatService.getOrCreateConversation(targetUser.id);
      setIsSearchModalOpen(false);
      
      // Update local list if not present
      setConversations((prev) => {
        if (!prev.find((c) => c.id === conv.id)) {
          return [conv, ...prev];
        }
        return prev;
      });

      onSelectConversation(conv);
    } catch (err) {
      console.error('Failed to create/open conversation:', err);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = c.other_user?.username || '';
    const fullName = `${c.other_user?.first_name || ''} ${c.other_user?.last_name || ''}`.trim();
    return (
      name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      fullName.toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  return (
    <>
      <aside className={`sidebar ${isMobileHidden ? 'hidden-mobile' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div
            className="sidebar-profile"
            style={{ cursor: 'pointer' }}
            onClick={() => setIsProfileModalOpen(true)}
            title="Click to edit profile"
          >
            <Avatar
              src={user?.avatar_display || user?.avatar_url}
              alt={user?.username}
              isOnline={true}
              size="md"
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {user?.username}
                <Sparkles size={13} color="var(--primary)" />
              </div>
              <div style={{ fontSize: 11, color: 'var(--online)', fontWeight: 500 }}>Online</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setIsSearchModalOpen(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow)',
                transition: 'var(--transition-fast)',
              }}
              title="Start New Chat"
            >
              <Plus size={18} />
            </button>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
              title="Settings & Profile"
            >
              <Settings size={17} />
            </button>

            <button
              onClick={logout}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="sidebar-search">
          <div className="input-with-icon">
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="form-input"
              style={{ padding: '9px 12px 9px 38px', fontSize: 13 }}
              placeholder="Search chats or start new..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="conversations-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 13 }}>
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)', marginBottom: 6 }}>
                {searchFilter ? 'No matching chats' : 'No conversations yet'}
              </p>
              <p style={{ fontSize: 12, marginBottom: 16 }}>
                {searchFilter ? 'Try a different search query.' : 'Start a new conversation with any user!'}
              </p>
              <button
                className="btn-primary"
                onClick={() => setIsSearchModalOpen(true)}
                style={{ width: 'auto', margin: '0 auto', padding: '8px 16px', fontSize: 13 }}
              >
                <Plus size={15} /> Start Chat
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeConversation?.id === conv.id}
                onClick={() => onSelectConversation(conv)}
              />
            ))
          )}
        </div>
      </aside>

      <UserSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectUser={handleStartChatWithUser}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
