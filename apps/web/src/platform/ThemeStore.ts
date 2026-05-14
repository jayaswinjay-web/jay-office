import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  followSystem: boolean
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  followSystem: true,
  theme: 'system',
  setTheme: (theme) => set({ theme, followSystem: theme === 'system' }),
}))
