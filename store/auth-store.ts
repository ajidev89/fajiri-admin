import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/services/auth";

interface AuthState {
    user: User | null;
    loginEmail: string | null;
    otpFlow: "login" | "reset-password" | null;
    setAuthData: (
        user: User | null,
        email: string,
        flow?: "login" | "reset-password" | null,
    ) => void;
    setOtpFlow: (flow: "login" | "reset-password" | null) => void;
    setUser: (user: User) => void;
    clearAuthData: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            loginEmail: null,
            otpFlow: null,
            setAuthData: (user, email, flow = "login") =>
                set({ user, loginEmail: email, otpFlow: flow }),
            setOtpFlow: (flow) => set({ otpFlow: flow }),
            setUser: (user) => set({ user }),
            clearAuthData: () =>
                set({ user: null, loginEmail: null, otpFlow: null }),
        }),
        {
            name: "fajiri-auth-storage",
            storage: createJSONStorage(() => localStorage),
            version: 2,
            migrate: (persistedState: any, version: number) => {
                if (version < 2) {
                    // Reset stale or incompatible localStorage from earlier app versions
                    return {
                        user: null,
                        loginEmail: null,
                        otpFlow: null,
                    };
                }
                return persistedState as AuthState;
            },
        }
    )
);
