interface Props {
  children: string
}

export default function SectionLabel({ children }: Props) {
  return (
    <div className="flex items-center gap-4">
      <span
        className="font-mono text-text-tertiary shrink-0"
        style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
      >
        {children}
      </span>
      <div className="flex-1" style={{ height: '0.5px', background: 'var(--color-border)' }} />
    </div>
  )
}
