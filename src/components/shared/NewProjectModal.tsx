import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { IconX, IconChevronDown, IconChevronUp, IconPhoto, IconCrop } from '@tabler/icons-react'
import { PROJECT_FORMATS, GENRE_OPTIONS } from '@/types/project'
import type { ProjectFormat } from '@/types/project'
import type { SaveProjectInput } from '@/services/projects'
import { cropImageToFile } from '@/utils/cropImage'

// Card thumbnail aspect ratio: 220 wide / 100 tall
const CROP_ASPECT = 220 / 100

interface InitialData {
  title: string
  format: ProjectFormat | null
  logline: string | null
  genres: string[]
  thumbnailUrl: string | null
}

interface Props {
  initialData?: InitialData
  onSave: (input: SaveProjectInput) => Promise<void>
  onClose: () => void
}

export default function NewProjectModal({ initialData, onSave, onClose }: Props) {
  const isEditing = !!initialData
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [format, setFormat] = useState<ProjectFormat | null>(initialData?.format ?? null)
  const [showOptional, setShowOptional] = useState(isEditing)
  const [logline, setLogline] = useState(initialData?.logline ?? '')
  const [genres, setGenres] = useState<string[]>(initialData?.genres ?? [])

  // Thumbnail states
  const [rawSrc, setRawSrc] = useState<string | null>(null)        // original picked image
  const [showCropper, setShowCropper] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnailUrl ?? null)
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !showCropper) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, showCropper])

  const openCropper = (file: File) => {
    const url = URL.createObjectURL(file)
    setRawSrc(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setShowCropper(true)
    setThumbnailRemoved(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) openCropper(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) openCropper(file)
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const applyCrop = async () => {
    if (!rawSrc || !croppedAreaPixels) return
    const file = await cropImageToFile(rawSrc, croppedAreaPixels)
    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
    setShowCropper(false)
  }

  const cancelCrop = () => {
    setShowCropper(false)
    if (!thumbnailFile) setRawSrc(null)
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setRawSrc(null)
    setThumbnailRemoved(true)
  }

  const toggleGenre = (g: string) =>
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])

  const handleSave = async () => {
    const trimmed = title.trim()
    if (!trimmed || saving) return
    setSaving(true)
    setError(null)
    try {
      await onSave({ title: trimmed, format, logline, genres, thumbnailFile, removeThumbnail: thumbnailRemoved })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save project.')
      setSaving(false)
    }
  }

  return (
    <div
      onClick={() => { if (!showCropper) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
          width: 460,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── Crop overlay ── */}
        {showCropper && rawSrc && (
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'var(--color-surface)',
              borderRadius: 14,
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Crop header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '0.5px solid var(--color-border)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconCrop size={14} style={{ color: 'var(--color-accent)' }} />
                <span className="font-mono uppercase" style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: 'var(--color-text-tertiary)' }}>
                  Crop Thumbnail
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: '0.58rem', color: 'var(--color-text-tertiary)' }}>
                440 × 200 px
              </span>
            </div>

            {/* Cropper canvas */}
            <div style={{ flex: 1, position: 'relative', background: '#111' }}>
              <Cropper
                image={rawSrc}
                crop={crop}
                zoom={zoom}
                aspect={CROP_ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: { borderRadius: 0 },
                  cropAreaStyle: {
                    border: '2px solid var(--color-accent)',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                  },
                }}
              />
            </div>

            {/* Zoom slider */}
            <div style={{
              padding: '14px 24px',
              borderTop: '0.5px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: 12,
              flexShrink: 0,
            }}>
              <span className="font-mono" style={{ fontSize: '0.58rem', color: 'var(--color-text-tertiary)', minWidth: 32 }}>
                Zoom
              </span>
              <input
                type="range"
                min={1} max={3} step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--color-accent)', cursor: 'pointer' }}
              />
            </div>

            {/* Crop footer */}
            <div style={{
              padding: '14px 24px 18px',
              borderTop: '0.5px solid var(--color-border)',
              display: 'flex', gap: 10, justifyContent: 'flex-end',
              flexShrink: 0,
            }}>
              <button onClick={cancelCrop} className="font-mono" style={secondaryBtnStyle}>
                Cancel
              </button>
              <button onClick={applyCrop} className="font-mono" style={primaryBtnStyle}>
                Apply Crop
              </button>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '0.5px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <span className="font-mono uppercase" style={{ fontSize: '1rem', letterSpacing: '0.12em', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
            {isEditing ? 'Edit Project' : 'New Project'}
          </span>
          <button onClick={onClose} style={{ color: 'var(--color-text-tertiary)', lineHeight: 0 }}>
            <IconX size={16} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 24px 0' }}>

          <Field label="Title">
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              placeholder="Untitled film"
              disabled={saving}
              style={inputStyle}
            />
          </Field>

          <Field label="Format" style={{ marginTop: 16 }}>
            <select
              value={format ?? ''}
              onChange={(e) => setFormat((e.target.value as ProjectFormat) || null)}
              disabled={saving}
              style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
            >
              <option value="">Select format…</option>
              {PROJECT_FORMATS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>

          {/* Optional info toggle */}
          <button
            onClick={() => setShowOptional((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginTop: 20,
              color: 'var(--color-text-secondary)',
              padding: '8px 0',
              width: '100%',
            }}
          >
            <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
            <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
              Optional Info
            </span>
            {showOptional
              ? <IconChevronUp size={13} style={{ flexShrink: 0 }} />
              : <IconChevronDown size={13} style={{ flexShrink: 0 }} />}
          </button>

          {showOptional && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 4 }}>

              {/* Thumbnail */}
              <Field label="Thumbnail">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                <div
                  onClick={() => !thumbnailPreview && fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    height: 108,
                    borderRadius: 8,
                    border: `1px dashed ${dragOver ? 'var(--color-accent)' : thumbnailPreview ? 'transparent' : 'var(--color-border)'}`,
                    background: thumbnailPreview ? undefined : dragOver ? 'var(--color-accent-muted)' : 'var(--color-surface-raised)',
                    backgroundImage: thumbnailPreview ? `url(${thumbnailPreview})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: thumbnailPreview ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 6,
                    transition: 'border-color 150ms, background 150ms',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {!thumbnailPreview && (
                    <>
                      <IconPhoto size={20} style={{ color: 'var(--color-text-tertiary)' }} />
                      <span className="font-mono" style={{ fontSize: '0.58rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
                        Click or drag image
                      </span>
                    </>
                  )}

                  {thumbnailPreview && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0)',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                      gap: 6, padding: 6,
                      opacity: 0,
                      transition: 'opacity 150ms',
                    }}
                      className="thumb-actions"
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); if (rawSrc) { setCrop({ x: 0, y: 0 }); setZoom(1); setShowCropper(true) } else fileRef.current?.click() }}
                        title="Re-crop"
                        style={iconBtnStyle}
                      >
                        <IconCrop size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeThumbnail() }}
                        title="Remove"
                        style={iconBtnStyle}
                      >
                        <IconX size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {thumbnailPreview && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { if (rawSrc) { setCrop({ x: 0, y: 0 }); setZoom(1); setShowCropper(true) } else fileRef.current?.click() }}
                      className="font-mono"
                      style={{ ...secondaryBtnStyle, fontSize: '0.58rem', padding: '5px 12px' }}
                    >
                      Re-crop
                    </button>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="font-mono"
                      style={{ ...secondaryBtnStyle, fontSize: '0.58rem', padding: '5px 12px' }}
                    >
                      Change image
                    </button>
                  </div>
                )}
              </Field>

              {/* Logline */}
              <Field label={`Logline  ${logline.length}/100`}>
                <textarea
                  value={logline}
                  onChange={(e) => setLogline(e.target.value.slice(0, 100))}
                  placeholder="One sentence that captures the essence of the story."
                  rows={3}
                  disabled={saving}
                  style={{ ...inputStyle, height: 'auto', resize: 'none', lineHeight: 1.5, paddingTop: 10, paddingBottom: 10 }}
                />
              </Field>

              {/* Genres */}
              <Field label="Genres">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {GENRE_OPTIONS.map((g) => {
                    const active = genres.includes(g)
                    return (
                      <button
                        key={g}
                        onClick={() => toggleGenre(g)}
                        className="font-mono"
                        style={{
                          padding: '5px 12px', borderRadius: 20,
                          fontSize: '0.6rem', letterSpacing: '0.06em',
                          border: `0.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          background: active ? 'var(--color-accent-muted)' : 'transparent',
                          color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                        }}
                      >
                        {g}
                      </button>
                    )
                  })}
                </div>
              </Field>

              {/* Collaborators */}
              <Field label="Collaborators">
                <div className="font-mono" style={{
                  padding: '10px 14px', borderRadius: 8,
                  border: '0.5px solid var(--color-border)',
                  background: 'var(--color-surface-raised)',
                  fontSize: '0.62rem', color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.04em', opacity: 0.6, cursor: 'not-allowed',
                }}>
                  Invite collaborators — coming soon
                </div>
              </Field>

            </div>
          )}

          <div style={{ height: 24 }} />
        </div>

        {/* ── Footer ── */}
        <div style={{
          flexShrink: 0,
          padding: '16px 24px 20px',
          borderTop: '0.5px solid var(--color-border)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {error && (
            <p className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--color-danger)' }}>
              {error}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onClose} disabled={saving} className="font-mono" style={secondaryBtnStyle}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="font-mono"
              style={{
                ...primaryBtnStyle,
                background: title.trim() && !saving ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                color: title.trim() && !saving ? 'var(--color-background)' : 'var(--color-text-tertiary)',
                cursor: title.trim() && !saving ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Save Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── shared styles ──────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', height: 40, borderRadius: 8,
  border: '0.5px solid var(--color-border)',
  background: 'var(--color-surface-raised)',
  color: 'var(--color-text-primary)',
  padding: '0 12px', fontSize: '0.82rem', outline: 'none',
}

const secondaryBtnStyle: React.CSSProperties = {
  padding: '9px 20px', borderRadius: 8,
  border: '0.5px solid var(--color-border)',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  fontSize: '0.65rem', cursor: 'pointer',
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '9px 24px', borderRadius: 8,
  border: 'none',
  background: 'var(--color-accent)',
  color: 'var(--color-background)',
  fontSize: '0.65rem', fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 150ms, color 150ms',
}

const iconBtnStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.6)',
  border: 'none',
  borderRadius: 4,
  padding: 4,
  lineHeight: 0,
  color: '#fff',
  cursor: 'pointer',
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7, ...style }}>
      <span className="font-mono uppercase" style={{ fontSize: '0.58rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.12em' }}>
        {label}
      </span>
      {children}
    </label>
  )
}
