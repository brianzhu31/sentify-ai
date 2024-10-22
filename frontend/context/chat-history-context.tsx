import { createContext, useState, useContext, ReactNode } from 'react';
import { PaginatedChatHistoryData } from '@/types';

interface ChatHistoryContextType {
  chatHistory: PaginatedChatHistoryData;
  setChatHistory: (chatHistory: PaginatedChatHistoryData) => void;
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export const useChatHistory = (): ChatHistoryContextType => {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};

interface ChatHistoryProviderProps {
  children: ReactNode;
}

export const ChatHistoryProvider = ({ children }: ChatHistoryProviderProps) => {
  const [chatHistory, setChatHistory] = useState<PaginatedChatHistoryData>({
    label: '',
    chats: [],
    has_more: true
  });
  const [pageNumber, setPageNumber] = useState<number>(1);

  return (
    <ChatHistoryContext.Provider value={{ chatHistory, setChatHistory, pageNumber, setPageNumber }}>
      {children}
    </ChatHistoryContext.Provider>
  );
};
