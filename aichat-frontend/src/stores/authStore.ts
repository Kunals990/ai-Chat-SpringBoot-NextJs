import { create } from "zustand";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';

interface User {
    email: string;
    name: string;
    picture?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({

    user: null,
    isAuthenticated: false,
    loading: true,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setLoading: (loading) => set({ loading }),

    logout: async () => {
        await fetch(`${backendUrl}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        set({ user: null, isAuthenticated: false });
    },

    fetchUser: async () => {
        set({ loading: true });
        try {
            const res = await fetch(`${backendUrl}/user/me`, {
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                console.log(data);
                set({ user: data, isAuthenticated: true });
            } else {
                set({ user: null, isAuthenticated: false });
            }
        } catch (err) {
            console.error("Auth check failed:", err);
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ loading: false });
        }
    },
}));
