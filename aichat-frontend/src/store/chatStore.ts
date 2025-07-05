import { create } from 'zustand';

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

// DTO interface for backend response
interface SessionChatsResponse {
  message: string;
  role: 'USER' | 'ASSISTANT'; // Backend uses uppercase
  LLM: string;
  timestamp: string; // LocalDateTime from backend comes as string
}

interface ChatStore {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setMessagesFromResponse: (responses: SessionChatsResponse[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  setMessagesFromResponse: (responses) => {
    const messages = responses.map((response, index) => ({
      id: `${response.timestamp}-${index}`,
      content: response.message,
      role: response.role.toLowerCase() as 'user' | 'assistant',
      timestamp: new Date(response.timestamp)
    }));
    set({ messages });
  },
}));