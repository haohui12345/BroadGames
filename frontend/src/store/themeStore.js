import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // default dark
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.classList.toggle('dark', next === 'dark')
        set({ theme: next })
      },
      initTheme: () => {
        const { theme } = get()
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },
    }),
    { name: 'theme-storage' }
  )
)
