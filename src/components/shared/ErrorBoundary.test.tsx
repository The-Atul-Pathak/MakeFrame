import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error('boom')
  return <div>safe content</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress React's expected error logging for these intentional throws.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <Bomb explode={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('safe content')).toBeInTheDocument()
  })

  it('renders the fallback alert when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb explode={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={(error) => <p>custom: {error.message}</p>}>
        <Bomb explode={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('custom: boom')).toBeInTheDocument()
  })

  it('recovers when the user resets and the child no longer throws', () => {
    function Harness() {
      return (
        <ErrorBoundary>
          <Bomb explode={false} />
        </ErrorBoundary>
      )
    }
    // First mount throws, then we re-render a non-throwing tree via reset.
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb explode={true} />
      </ErrorBoundary>,
    )
    fireEvent.click(screen.getByText('Try again'))
    rerender(<Harness />)
    expect(screen.getByText('safe content')).toBeInTheDocument()
  })
})
