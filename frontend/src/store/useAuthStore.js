import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ token: null, user: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'plr-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
)
