import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/services/auth";

interface AuthState {
    user: User | null;
    loginEmail: string | null;
    setAuthData: (user: User, email: string) => void;
    setUser: (user: User) => void;
    clearAuthData: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            loginEmail: null,
            setAuthData: (user, email) => set({ user, loginEmail: email }),
            setUser: (user) => set({ user }),
            clearAuthData: () => set({ user: null, loginEmail: null }),
        }),
        {
            name: "fajiri-auth-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
