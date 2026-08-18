import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const POPULAR_EMOJIS = ['😊', '😂', '🔥', '❤️', '👍', '🎉', '🚀', '🙌', '✨', '💯', '😎', '👋', '🤔', '😍', '👏', '🥳'];

const MessageInput = ({ conversationId, onSendMessage }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { sendTypingStatus } = useSocket();
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);
  const inputRef = useRef(null);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    // Trigger typing event
    if (!isTypingRef.current && val.trim().length > 0) {
      isTypingRef.current = true;
      sendTypingStatus(conversationId, true);
    }

    // Reset timer
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        sendTypingStatus(conversationId, false);
      }
    }, 1800);
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;

    onSendMessage(cleanText);
    setText('');
    setShowEmojiPicker(false);

    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTypingStatus(conversationId, false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  // Cleanup typing timeout on unmount or conversation change
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (isTypingRef.current) {
        sendTypingStatus(conversationId, false);
      }
    };
  }, [conversationId, sendTypingStatus]);

  return (
    <div className="chat-input-area" style={{ position: 'relative' }}>
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 24,
            marginBottom: 12,
            background: 'var(--bg-card)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            boxShadow: 'var(--shadow-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: 8,
            zIndex: 50,
          }}
        >
          {POPULAR_EMOJIS.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectEmoji(emoji)}
              style={{
                fontSize: 20,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSend}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          style={{
            background: 'transparent',
            border: 'none',
            color: showEmojiPicker ? 'var(--primary)' : 'var(--text-subtle)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}
          title="Insert Emoji"
        >
          <Smile size={20} />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            fontSize: 14,
            outline: 'none',
            fontFamily: 'var(--font-body)',
          }}
        />

        <button
          type="submit"
          disabled={!text.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-sm)',
            background: text.trim() ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: text.trim() ? 'pointer' : 'default',
            transition: 'var(--transition-fast)',
            boxShadow: text.trim() ? 'var(--shadow-glow)' : 'none',
          }}
          title="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
