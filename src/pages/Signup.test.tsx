import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthProvider'
import Signup from '@/pages/Signup'

const { mockGetSession, mockOnAuthStateChange, mockSignUp } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  mockSignUp: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signUp: mockSignUp,
    },
  },
}))

function renderSignup() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<div>Dashboard Home</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

function fillForm(password: string, confirmPassword: string) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newpilot@makeframe.dev' } })
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: password } })
  fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: confirmPassword } })
}

describe('Signup', () => {
  beforeEach(() => {
    mockGetSession.mockReset().mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockClear()
    mockSignUp.mockReset()
  })

  it('rejects mismatched passwords client-side without calling Supabase', async () => {
    renderSignup()
    await screen.findByLabelText(/email/i)

    fillForm('password123', 'password456')
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows a confirmation-pending message when email confirmation is required', async () => {
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null })
    renderSignup()
    await screen.findByLabelText(/email/i)

    fillForm('password123', 'password123')
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
  })

  it('navigates to / when a session is created immediately', async () => {
    mockSignUp.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null })
    renderSignup()
    await screen.findByLabelText(/email/i)

    fillForm('password123', 'password123')
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => expect(mockSignUp).toHaveBeenCalled())
    expect(await screen.findByText('Dashboard Home')).toBeInTheDocument()
  })
})
