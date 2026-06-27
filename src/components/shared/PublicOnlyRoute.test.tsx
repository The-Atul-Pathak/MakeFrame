import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { AuthProvider } from '@/contexts/AuthProvider'
import PublicOnlyRoute from '@/components/shared/PublicOnlyRoute'

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

function renderPublicOnly(initialEntry: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>Login Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('PublicOnlyRoute', () => {
  beforeEach(() => {
    mockGetSession.mockReset()
    mockOnAuthStateChange.mockClear()
  })

  it('redirects an already-authenticated user away from /login', async () => {
    mockGetSession.mockResolvedValue({ data: { session: fakeSession } })

    renderPublicOnly('/login')

    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('renders the login page for an unauthenticated visitor', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    renderPublicOnly('/login')

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })
})
