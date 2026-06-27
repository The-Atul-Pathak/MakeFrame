import { useRef, useEffect, useState } from 'react'
import { IconEraser, IconPencil, IconTrash } from '@tabler/icons-react'

type Tool = 'pencil' | 'eraser'

interface Props {
  dataUrl: string | null
  onChange: (dataUrl: string) => void
  width?: number
  height?: number
  readOnly?: boolean
}

export default function SketchCanvas({ dataUrl, onChange, width = 480, height = 270, readOnly = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('pencil')
  const [drawing, setDrawing] = useState(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)

  // Load existing dataUrl into canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#f5f3ef'
    ctx.fillRect(0, 0, width, height)

    if (dataUrl) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = dataUrl
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = width / rect.width
    const scaleY = height / rect.height
    if ('touches' in e) {
      const touch = (e as React.TouchEvent).touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly) return
    e.preventDefault()
    setDrawing(true)
    lastPoint.current = getPos(e)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || readOnly) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getPos(e)
    const lp = lastPoint.current ?? pos

    ctx.beginPath()
    ctx.moveTo(lp.x, lp.y)
    ctx.lineTo(pos.x, pos.y)

    if (tool === 'pencil') {
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 1.5
      ctx.globalCompositeOperation = 'source-over'
    } else {
      ctx.strokeStyle = '#f5f3ef'
      ctx.lineWidth = 16
      ctx.globalCompositeOperation = 'source-over'
    }

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    lastPoint.current = pos
  }

  const endDraw = () => {
    if (!drawing) return
    setDrawing(false)
    lastPoint.current = null
    const canvas = canvasRef.current
    if (canvas) onChange(canvas.toDataURL())
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#f5f3ef'
    ctx.fillRect(0, 0, width, height)
    onChange(canvas.toDataURL())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Canvas */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#f5f3ef', borderRadius: 4, overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ width: '100%', height: '100%', display: 'block', cursor: readOnly ? 'default' : tool === 'pencil' ? 'crosshair' : 'cell' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!dataUrl && !drawing && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              opacity: 0.3,
            }}
          >
            <span className="font-mono" style={{ fontSize: '0.6rem', color: '#6b6966', letterSpacing: '0.06em' }}>
              SKETCH AREA
            </span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      {!readOnly && (
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            onClick={() => setTool('pencil')}
            title="Pencil"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              background: tool === 'pencil' ? 'var(--color-accent)' : 'var(--color-surface-raised)',
              border: `0.5px solid ${tool === 'pencil' ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
              borderRadius: 4,
              cursor: 'pointer',
              color: tool === 'pencil' ? 'var(--color-background)' : 'var(--color-text-secondary)',
              transition: 'all 120ms',
            }}
          >
            <IconPencil size={12} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            title="Eraser"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              background: tool === 'eraser' ? 'var(--color-accent)' : 'var(--color-surface-raised)',
              border: `0.5px solid ${tool === 'eraser' ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
              borderRadius: 4,
              cursor: 'pointer',
              color: tool === 'eraser' ? 'var(--color-background)' : 'var(--color-text-secondary)',
              transition: 'all 120ms',
            }}
          >
            <IconEraser size={12} />
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={clearCanvas}
            title="Clear canvas"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              background: 'transparent',
              border: '0.5px solid var(--color-border-subtle)',
              borderRadius: 4,
              cursor: 'pointer',
              color: 'var(--color-danger)',
              transition: 'all 120ms',
            }}
          >
            <IconTrash size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
