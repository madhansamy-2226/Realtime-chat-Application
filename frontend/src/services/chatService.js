import api from './api';

export const chatService = {
  // Fetch user conversations
  getConversations: async () => {
    const response = await api.get('/chat/conversations/');
    return response.data;
  },

  // Start or open conversation with another user
  getOrCreateConversation: async (receiverId) => {
    const response = await api.post('/chat/conversations/', { receiver_id: receiverId });
    return response.data;
  },

  // Fetch message history for a conversation
  getMessages: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages/`);
    return response.data;
  },

  // Fallback REST message send
  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages/`, { content });
    return response.data;
  },

  // Mark all unread messages in conversation as read
  markAsRead: async (conversationId) => {
    const response = await api.post(`/chat/conversations/${conversationId}/read/`);
    return response.data;
  },

  // Delete own message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/messages/${messageId}/`);
    return response.data;
  },

  // Search users to start new chat
  searchUsers: async (query = '') => {
    const response = await api.get(`/users/search/?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};
