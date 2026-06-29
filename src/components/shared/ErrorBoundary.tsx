import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Sentry } from '@/lib/sentry'

interface Props {
  children: ReactNode
  /** Optional custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  error: Error | null
}

/**
 * Catches render-time errors anywhere in its subtree and shows a recoverable
 * fallback instead of unmounting the whole app to a blank screen.
 *
 * React only surfaces render/lifecycle errors here — event-handler and async
 * errors must still be handled where they occur.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info.componentStack)
    Sentry.captureException(error, { contexts: { react: { componentStack: info.componentStack } } })
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) return this.props.fallback(error, this.reset)

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: '32rem', color: '#666', margin: 0 }}>
          An unexpected error occurred. You can try again — if it keeps happening, please reload the
          page.
        </p>
        <button
          onClick={this.reset}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid #ccc',
            background: '#111',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
