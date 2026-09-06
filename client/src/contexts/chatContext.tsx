import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './authContext';
import { ChatMessage } from '../types/chat.types';

interface ChatContextType {
  messages: ChatMessage[];
  connected: boolean;
  sendMessage: (body: string, targetUserId?: number) => void;
  markRead: (targetUserId?: number) => void;
  loadMessages: (messages: ChatMessage[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      setMessages([]);
      return;
    }

    const token = localStorage.getItem('access_token');
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000', {
      auth: { token },
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('newMessage', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  const sendMessage = (body: string, targetUserId?: number) => {
    socketRef.current?.emit(
      'sendMessage',
      targetUserId ? { body, user_id: targetUserId } : { body },
    );
  };

  const markRead = (targetUserId?: number) => {
    socketRef.current?.emit('markRead', targetUserId ? { user_id: targetUserId } : {});
  };

  const loadMessages = (initial: ChatMessage[]) => {
    setMessages(initial);
  };

  const value: ChatContextType = {
    messages,
    connected,
    sendMessage,
    markRead,
    loadMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
