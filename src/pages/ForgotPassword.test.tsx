import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthProvider'
import ForgotPassword from '@/pages/ForgotPassword'

const { mockGetSession, mockOnAuthStateChange, mockResetPasswordForEmail } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  mockResetPasswordForEmail: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  },
}))

function renderForgotPassword() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/forgot-password']}>
        <ForgotPassword />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ForgotPassword', () => {
  beforeEach(() => {
    mockGetSession.mockReset().mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockClear()
    mockResetPasswordForEmail.mockReset()
  })

  it('shows a confirmation message after a reset link is requested', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    renderForgotPassword()

    fireEvent.change(await screen.findByLabelText(/email/i), { target: { value: 'pilot@makeframe.dev' } })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'pilot@makeframe.dev',
      expect.objectContaining({ redirectTo: expect.stringContaining('/reset-password') }),
    )
  })

  it('shows an error message when the request fails', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: new Error('Network error') })
    renderForgotPassword()

    fireEvent.change(await screen.findByLabelText(/email/i), { target: { value: 'pilot@makeframe.dev' } })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    expect(await screen.findByText('Network error')).toBeInTheDocument()
  })
})
