import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            setUser: (username) => set({ user: username }),
            logout: () => set({ user: null }),
        }),
        {
            name: "auth-storage",
        }
    )
);
