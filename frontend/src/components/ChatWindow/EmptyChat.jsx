import React from 'react';
import { MessageSquare, Lock, Zap, Users } from 'lucide-react';

const EmptyChat = ({ onStartChat }) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.04) 0%, transparent 70%)',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: 'var(--primary-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: 'var(--shadow-glow)',
          marginBottom: 24,
          animation: 'popIn 0.4s ease-out',
        }}
      >
        <MessageSquare size={38} />
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>
        PulseChat Web
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 380, lineHeight: 1.5, marginBottom: 28 }}>
        Select an active conversation from the sidebar or click below to search users and start a new real-time conversation.
      </p>

      <button
        className="btn-primary"
        onClick={onStartChat}
        style={{ width: 'auto', padding: '12px 24px', fontSize: 14, borderRadius: 999 }}
      >
        <Users size={16} /> New Conversation
      </button>

      <div
        style={{
          display: 'flex',
          gap: 24,
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--text-subtle)',
          fontSize: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={14} color="var(--primary)" /> Real-Time WebSockets
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={14} color="var(--online)" /> JWT Authenticated
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;
