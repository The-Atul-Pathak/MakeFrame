import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import { IconBrandGoogle } from '@tabler/icons-react'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'
import AuthLayout, { Field, Divider } from '@/components/shared/AuthLayout'
import { inputStyle, primaryBtnStyle, secondaryBtnStyle, linkStyle, errorTextStyle } from '@/components/shared/authFormStyles'

export default function Login() {
  usePageMeta({
    title: 'Sign in — MakeFrame',
    description: 'Sign in to MakeFrame to continue pre-producing your film.',
    path: '/login',
  })
  const { signInWithPassword, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await signInWithPassword(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.')
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in with Google.')
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your projects."
      footer={
        <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" style={linkStyle}>Create one</Link>
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            style={inputStyle}
          />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
          <Link to="/forgot-password" style={linkStyle}>Forgot password?</Link>
        </div>

        {error && <p className="font-mono" style={errorTextStyle}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="font-mono"
          style={{ ...primaryBtnStyle, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
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
