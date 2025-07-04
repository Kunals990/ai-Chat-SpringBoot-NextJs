import { create } from 'zustand';

interface Session {
  id: string;
  sessionName: string;
  timestamp: string;
}

interface SessionStore {
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  addSessions: (session: Session) => void; 
  clearSessions: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  addSessions: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),
  clearSessions: () => set({ sessions: [] }),
}));
