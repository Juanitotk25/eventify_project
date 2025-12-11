// src/stores/useAuthStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null, // Añade el rol aquí
      email: null, // Añade email también si es necesario
      
      // Modifica setUser para recibir todos los datos
      setUser: (userData) => set({ 
        user: userData.username || userData.user,
        role: userData.role,
        email: userData.email 
      }),
      
      logout: () => set({ user: null, role: null, email: null }),
      
      // Helper para verificar si es admin
      isAdmin: () => {
        const state = get();
        return state.role === 'admin';
      }
    }),
    {
      name: "auth-storage",
    }
  )
);