import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'
import AuthLayout, { Field } from '@/components/shared/AuthLayout'
import { inputStyle, primaryBtnStyle, linkStyle, errorTextStyle } from '@/components/shared/authFormStyles'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPassword() {
  usePageMeta({ title: 'Set a new password — MakeFrame', noIndex: true })
  const { user, loading, updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await updatePassword(password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password.')
      setSubmitting(false)
    }
  }

  if (loading) return null

  // The recovery link exchanges itself for a session on load (detectSessionInUrl).
  // No session at this point means the link is invalid, expired, or already used.
  if (!user) {
    return (
      <AuthLayout title="Link expired" subtitle="This password reset link is invalid or has expired.">
        <Link to="/forgot-password" style={linkStyle}>Request a new link</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="New password">
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            style={inputStyle}
          />
        </Field>

        <Field label="Confirm password">
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
            style={inputStyle}
          />
        </Field>

        {error && <p className="font-mono" style={errorTextStyle}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="font-mono"
          style={{ ...primaryBtnStyle, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  )
}
