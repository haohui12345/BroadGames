import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({
        user: {
          ...user,
          // BE trả về full_name, FE dùng display_name
          display_name: user.display_name || user.full_name || user.username,
        },
        token,
        isAuthenticated: true,
      }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
)