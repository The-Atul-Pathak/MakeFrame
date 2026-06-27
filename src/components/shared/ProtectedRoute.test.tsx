import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { AuthProvider } from '@/contexts/AuthProvider'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

const { mockGetSession, mockOnAuthStateChange } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

const fakeSession = { user: { id: 'user-1', email: 'pilot@makeframe.dev' } } as unknown as Session

function renderProtected(initialEntry: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Secret Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockGetSession.mockReset()
    mockOnAuthStateChange.mockClear()
  })

  it('redirects unauthenticated users to /login instead of rendering protected content', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    renderProtected('/protected')

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument()
  })

  it('renders protected content for an authenticated user', async () => {
    mockGetSession.mockResolvedValue({ data: { session: fakeSession } })

    renderProtected('/protected')

    expect(await screen.findByText('Secret Content')).toBeInTheDocument()
  })
})
