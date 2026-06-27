import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthProvider'
import Login from '@/pages/Login'

const { mockGetSession, mockOnAuthStateChange, mockSignInWithPassword } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  mockSignInWithPassword: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
    },
  },
}))

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Dashboard Home</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('Login', () => {
  beforeEach(() => {
    mockGetSession.mockReset().mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockClear()
    mockSignInWithPassword.mockReset()
  })

  it('shows an error message when sign-in fails, without navigating away', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: new Error('Invalid login credentials') })

    renderLogin()

    fireEvent.change(await screen.findByLabelText(/email/i), { target: { value: 'pilot@makeframe.dev' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Home')).not.toBeInTheDocument()
  })

  it('navigates to / after a successful sign-in', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })

    renderLogin()

    fireEvent.change(await screen.findByLabelText(/email/i), { target: { value: 'pilot@makeframe.dev' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'correct-password' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'pilot@makeframe.dev',
        password: 'correct-password',
      })
    })
    expect(await screen.findByText('Dashboard Home')).toBeInTheDocument()
  })
})
