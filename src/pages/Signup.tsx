import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconBrandGoogle } from '@tabler/icons-react'
import { useAuth } from '@/hooks/useAuth'
import AuthLayout, { Field, Divider } from '@/components/shared/AuthLayout'
import { inputStyle, primaryBtnStyle, secondaryBtnStyle, linkStyle, errorTextStyle } from '@/components/shared/authFormStyles'

const MIN_PASSWORD_LENGTH = 8

export default function Signup() {
  const { signUpWithPassword, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)

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
      const { confirmedImmediately } = await signUpWithPassword(email.trim(), password)
      if (confirmedImmediately) {
        navigate('/', { replace: true })
      } else {
        setPendingConfirmation(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.')
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign up with Google.')
    }
  }

  if (pendingConfirmation) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent a confirmation link to ${email.trim()}. Open it to finish creating your account.`}>
        <Link to="/login" style={linkStyle}>Back to sign in</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start pre-producing your next film."
      footer={
        <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={linkStyle}>Sign in</Link>
        </span>
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

        <Field label="Password">
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
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <Divider label="OR" />

        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="font-mono"
          style={secondaryBtnStyle}
        >
          <IconBrandGoogle size={15} />
          Continue with Google
        </button>
      </form>
    </AuthLayout>
  )
}
