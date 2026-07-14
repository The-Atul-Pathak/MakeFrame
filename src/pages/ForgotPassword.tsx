import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'
import AuthLayout, { Field } from '@/components/shared/AuthLayout'
import { inputStyle, primaryBtnStyle, linkStyle, errorTextStyle } from '@/components/shared/authFormStyles'

export default function ForgotPassword() {
  usePageMeta({ title: 'Reset password — MakeFrame', noIndex: true })
  const { sendPasswordReset } = useAuth()

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await sendPasswordReset(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset link.')
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle={`If an account exists for ${email.trim()}, a password reset link is on its way.`}>
        <Link to="/login" style={linkStyle}>Back to sign in</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" style={linkStyle}>Back to sign in</Link>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Email">
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthLayout>
  )
}
