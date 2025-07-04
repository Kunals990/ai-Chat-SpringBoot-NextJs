import { create } from 'zustand';

interface Session {
  id: string;
  sessionName: string;
  timestamp: string;
}

interface SessionStore {
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  clearSessions: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  clearSessions: () => set({ sessions: [] }),
}));
