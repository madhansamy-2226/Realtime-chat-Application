import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/ChatWindow/ChatWindow';

const ChatPage = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  const handleBackToSidebar = () => {
    setActiveConversation(null);
  };

  return (
    <div className="app-container">
      {/* Sidebar: hidden on mobile if a conversation is open */}
      <Sidebar
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        isMobileHidden={isMobileView && !!activeConversation}
      />

      {/* Main Chat Area */}
      {(!isMobileView || activeConversation) && (
        <ChatWindow
          conversation={activeConversation}
          onBack={isMobileView ? handleBackToSidebar : null}
          onStartChat={() => {
            // Trigger new chat flow
            const newChatBtn = document.querySelector('.sidebar-header button[title="Start New Chat"]');
            if (newChatBtn) newChatBtn.click();
          }}
        />
      )}
    </div>
  );
};

export default ChatPage;
