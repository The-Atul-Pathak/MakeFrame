import { create } from 'zustand'

interface SyncStatusState {
  error: string | null
  setError: (message: string) => void
  clearError: () => void
}

/**
 * Background Supabase writes (optimistic local update + fire-and-forget
 * persist) report failures here instead of throwing, since the calling
 * component already moved on. ProjectWorkspace surfaces `error` in a single
 * shared banner so a failed save is never silently lost.
 */
export const useSyncStatusStore = create<SyncStatusState>()((set) => ({
  error: null,
  setError: (message) => set({ error: message }),
  clearError: () => set({ error: null }),
}))
