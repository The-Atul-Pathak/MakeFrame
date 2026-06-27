import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthContextValue {
  session: Session | null
  user: User | null
  /** True until the initial session lookup resolves. */
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<void>
  /** Returns whether a session was created immediately (false if email confirmation is required). */
  signUpWithPassword: (email: string, password: string) => Promise<{ confirmedImmediately: boolean }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
