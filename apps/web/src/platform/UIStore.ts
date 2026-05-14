import { create } from 'zustand'

interface UIStore {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  activeWorkspaceId: string | null
  toggleSidebar: () => void
  setCommandPaletteOpen: (open: boolean) => void
  setActiveWorkspace: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  activeWorkspaceId: null,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
}))
