interface Props {
  fullScreen?: boolean
  label?: string
}

export default function RouteLoadingFallback({ fullScreen = false, label = 'Loading…' }: Props) {
  return (
    <div style={{ height: fullScreen ? '100vh' : '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
        {label}
      </span>
    </div>
  )
}
