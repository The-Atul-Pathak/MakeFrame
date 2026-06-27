import type { Character } from '@/types'

interface Props {
  character: Character
  allCharacters: Character[]
  onChange: (patch: Partial<Character>) => void
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.55rem',
  letterSpacing: '0.08em',
  color: 'var(--color-text-tertiary)',
  marginBottom: 4,
  display: 'block',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-surface-raised)',
  border: '0.5px solid var(--color-border-subtle)',
  borderRadius: 5,
  padding: '6px 8px',
  color: 'var(--color-text-primary)',
  fontFamily: 'Outfit, sans-serif',
  fontSize: '0.78rem',
  outline: 'none',
  lineHeight: 1.5,
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'none',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono" style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 8,
          borderBottom: '0.5px solid var(--color-border-subtle)',
        }}
      >
        <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}>
          {title}
        </span>
        <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border-subtle)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  )
}

export default function CharacterProfile({ character, allCharacters, onChange }: Props) {
  const otherCharacters = allCharacters.filter(c => c.id !== character.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: '24px 28px' }}>

      {/* Identity */}
      <Section title="IDENTITY">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="NAME">
            <input
              value={character.name}
              onChange={e => onChange({ name: e.target.value })}
              style={{ ...inputStyle, fontWeight: 600, fontSize: '0.88rem' }}
            />
          </Field>
          <Field label="AGE">
            <input
              value={character.age}
              onChange={e => onChange({ age: e.target.value })}
              placeholder="e.g. 32, mid-40s…"
              style={inputStyle}
            />
          </Field>
          <Field label="OCCUPATION">
            <input
              value={character.occupation}
              onChange={e => onChange({ occupation: e.target.value })}
              placeholder="Detective, artist…"
              style={inputStyle}
            />
          </Field>
        </div>
        <Field label="PHYSICAL DESCRIPTION">
          <textarea
            value={character.physicalDescription}
            onChange={e => onChange({ physicalDescription: e.target.value })}
            placeholder="Height, build, distinguishing features…"
            rows={2}
            style={textareaStyle}
          />
        </Field>
      </Section>

      {/* Psychology */}
      <Section title="PSYCHOLOGY">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="WANT (EXTERNAL GOAL)">
            <textarea
              value={character.want}
              onChange={e => onChange({ want: e.target.value })}
              placeholder="What they're consciously pursuing…"
              rows={3}
              style={textareaStyle}
            />
          </Field>
          <Field label="NEED (INTERNAL TRUTH)">
            <textarea
              value={character.need}
              onChange={e => onChange({ need: e.target.value })}
              placeholder="What they actually need to learn or change…"
              rows={3}
              style={textareaStyle}
            />
          </Field>
          <Field label="WOUND (PAST TRAUMA)">
            <textarea
              value={character.wound}
              onChange={e => onChange({ wound: e.target.value })}
              placeholder="Past trauma driving their behaviour…"
              rows={3}
              style={textareaStyle}
            />
          </Field>
          <Field label="GHOST (SPECIFIC EVENT)">
            <textarea
              value={character.ghost}
              onChange={e => onChange({ ghost: e.target.value })}
              placeholder="The specific memory that haunts them…"
              rows={3}
              style={textareaStyle}
            />
          </Field>
        </div>
      </Section>

      {/* Backstory & Arc */}
      <Section title="STORY">
        <Field label="BACKSTORY">
          <textarea
            value={character.backstory}
            onChange={e => onChange({ backstory: e.target.value })}
            placeholder="What shaped them before page 1…"
            rows={4}
            style={textareaStyle}
          />
        </Field>
        <Field label="ARC (WHERE THEY START → WHERE THEY END)">
          <textarea
            value={character.arc}
            onChange={e => onChange({ arc: e.target.value })}
            placeholder="Fearful loner → earns trust of others after tragedy…"
            rows={3}
            style={textareaStyle}
          />
        </Field>
      </Section>

      {/* Voice */}
      <Section title="VOICE">
        <Field label="HOW THEY SPEAK">
          <textarea
            value={character.voice}
            onChange={e => onChange({ voice: e.target.value })}
            placeholder="Vocabulary, rhythm, verbal tics, accent, sentence length…"
            rows={3}
            style={textareaStyle}
          />
        </Field>
      </Section>

      {/* Relationships */}
      {otherCharacters.length > 0 && (
        <Section title="RELATIONSHIPS">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {otherCharacters.map(other => (
              <div key={other.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 120,
                    paddingTop: 6,
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.62rem',
                      color: 'var(--color-text-secondary)',
                      fontWeight: 500,
                    }}
                  >
                    {other.name}
                  </span>
                  {other.occupation && (
                    <p
                      className="font-mono"
                      style={{ fontSize: '0.5rem', color: 'var(--color-text-tertiary)', marginTop: 1 }}
                    >
                      {other.occupation}
                    </p>
                  )}
                </div>
                <textarea
                  value={character.relationships[other.id] ?? ''}
                  onChange={e =>
                    onChange({
                      relationships: {
                        ...character.relationships,
                        [other.id]: e.target.value,
                      },
                    })
                  }
                  placeholder={`How ${character.name} sees ${other.name}…`}
                  rows={2}
                  style={{ ...textareaStyle, flex: 1 }}
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Stats (read-only) */}
      {(character.firstAppearanceSceneId || character.totalScenes > 0) && (
        <Section title="APPEARANCES">
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <p className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>TOTAL SCENES</p>
              <span className="font-mono" style={{ fontSize: '1rem', color: 'var(--color-accent)', fontWeight: 600 }}>{character.totalScenes}</span>
            </div>
          </div>
        </Section>
      )}
    </div>
  )
}
