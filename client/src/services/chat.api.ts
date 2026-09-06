import api from './api';
import { ChatMessage, ConversationSummary } from '../types/chat.types';

export const chatAPI = {
  getMyMessages: async (): Promise<ChatMessage[]> => {
    const response = await api.get<ChatMessage[]>('/chat/messages');
    return response.data;
  },

  getConversations: async (): Promise<ConversationSummary[]> => {
    const response = await api.get<ConversationSummary[]>('/chat/admin/conversations');
    return response.data;
  },

  getConversationMessages: async (userId: number): Promise<ChatMessage[]> => {
    const response = await api.get<ChatMessage[]>(`/chat/admin/messages/${userId}`);
    return response.data;
  },
};
