import { useState, useMemo } from 'react'
import {
  IconPlus, IconEdit, IconTrash, IconAlertTriangle,
  IconList, IconArrowUp, IconArrowDown,
} from '@tabler/icons-react'
import type { Project } from '@/types/project'
import type { Shot } from '@/types'
import { useSceneStore } from '@/store/sceneSlice'
import { useShotStore } from '@/store/shotSlice'
import ShotModal from '@/components/shotlist/ShotModal'

interface Props {
  project: Project
}

type SortKey = 'shotNumber' | 'location' | 'shotType' | 'estimatedSetupMinutes'

const COLUMNS = [
  { key: 'shotNumber',           label: '#',          width: 48 },
  { key: 'scene',                label: 'SCENE',       width: 80 },
  { key: 'intExt',               label: 'INT/EXT',     width: 70 },
  { key: 'location',             label: 'LOCATION',    width: 130 },
  { key: 'shotType',             label: 'SHOT',        width: 70 },
  { key: 'movement',             label: 'MOVEMENT',    width: 90 },
  { key: 'lens',                 label: 'LENS',        width: 60 },
  { key: 'description',          label: 'DESCRIPTION', flex: true },
  { key: 'cast',                 label: 'CAST',        width: 100 },
  { key: 'specialEquipment',     label: 'EQUIP',       width: 90 },
  { key: 'estimatedSetupMinutes',label: 'SETUP',       width: 60 },
  { key: 'actions',              label: '',            width: 60 },
]

const cellStyle: React.CSSProperties = {
  fontFamily: '"DM Mono", monospace',
  fontSize: '0.6rem',
  color: 'var(--color-text-secondary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  padding: '0 8px',
}

const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  color: 'var(--color-text-tertiary)',
  letterSpacing: '0.08em',
  fontSize: '0.55rem',
}

export default function ShotList({ project }: Props) {
  const { scenes } = useSceneStore()
  const { createShot, updateShot, deleteShot, getShotsForProject } = useShotStore()

  const projectScenes = scenes.filter(s => s.projectId === project.id).sort((a, b) => a.number - b.number)
  const projectShots = getShotsForProject(project.id).sort((a, b) => a.shotNumber - b.shotNumber)

  const [sortKey, setSortKey] = useState<SortKey>('shotNumber')
  const [sortAsc, setSortAsc] = useState(true)
  const [filterScene, setFilterScene] = useState<string>('all')
  const [filterLocation, setFilterLocation] = useState<string>('all')
  const [editingShot, setEditingShot] = useState<Shot | null>(null)
  const [addingShot, setAddingShot] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const sceneMap = Object.fromEntries(projectScenes.map((s, i) => [s.id, { scene: s, index: i }]))
  const locations = useMemo(() => [...new Set(projectShots.map(s => s.location).filter(Boolean))], [projectShots])

  const filtered = useMemo(() => {
    let result = [...projectShots]
    if (filterScene !== 'all') result = result.filter(s => s.sceneId === filterScene)
    if (filterLocation !== 'all') result = result.filter(s => s.location === filterLocation)
    result.sort((a, b) => {
      const av = a[sortKey] as number | string
      const bv = b[sortKey] as number | string
      const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv))
      return sortAsc ? cmp : -cmp
    })
    return result
  }, [projectShots, filterScene, filterLocation, sortKey, sortAsc])

  const totalSetup = filtered.reduce((acc, s) => acc + s.estimatedSetupMinutes, 0)
  const totalSetupHours = Math.floor(totalSetup / 60)
  const totalSetupMins = totalSetup % 60

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const handleAddShot = (patch: Partial<Shot>) => {
    const maxNum = projectShots.length > 0 ? Math.max(...projectShots.map(s => s.shotNumber)) : 0
    const sceneId = patch.sceneId ?? projectScenes[0]?.id ?? ''
    const shot = createShot(project.id, sceneId, patch)
    updateShot(shot.id, { shotNumber: maxNum + 1, ...patch })
  }

  const handleEditShot = (patch: Partial<Shot>) => {
    if (editingShot) updateShot(editingShot.id, patch)
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? (sortAsc ? <IconArrowUp size={9} /> : <IconArrowDown size={9} />)
      : null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '0.5px solid var(--color-border-subtle)',
          padding: '12px 24px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <h1 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
          Shot List
        </h1>

        <div style={{ flex: 1 }} />

        {/* Stats */}
        <span className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)' }}>
          {filtered.length} shots · setup {totalSetupHours}h {totalSetupMins}m
        </span>

        {/* Scene filter */}
        <select
          value={filterScene}
          onChange={e => setFilterScene(e.target.value)}
          style={{
            background: 'var(--color-surface-raised)',
            border: '0.5px solid var(--color-border-subtle)',
            borderRadius: 5,
            padding: '4px 8px',
            color: 'var(--color-text-secondary)',
            fontFamily: '"DM Mono", monospace',
            fontSize: '0.6rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all" style={{ background: 'var(--color-surface-raised)' }}>All scenes</option>
          {projectScenes.map((s, i) => (
            <option key={s.id} value={s.id} style={{ background: 'var(--color-surface-raised)' }}>
              {String(i + 1).padStart(2, '0')} — {s.intExt}. {s.location}
            </option>
          ))}
        </select>

        {/* Location filter */}
        {locations.length > 0 && (
          <select
            value={filterLocation}
            onChange={e => setFilterLocation(e.target.value)}
            style={{
              background: 'var(--color-surface-raised)',
              border: '0.5px solid var(--color-border-subtle)',
              borderRadius: 5,
              padding: '4px 8px',
              color: 'var(--color-text-secondary)',
              fontFamily: '"DM Mono", monospace',
              fontSize: '0.6rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all" style={{ background: 'var(--color-surface-raised)' }}>All locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc} style={{ background: 'var(--color-surface-raised)' }}>{loc}</option>
            ))}
          </select>
        )}

        {/* Add shot */}
        <button
          onClick={() => setAddingShot(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--color-background)',
          }}
        >
          <IconPlus size={12} />
          <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.06em' }}>ADD SHOT</span>
        </button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
        {projectShots.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '80px 0', opacity: 0.5 }}>
            <IconList size={32} style={{ color: 'var(--color-text-tertiary)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>No shots yet</span>
            <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
              Hit <strong style={{ color: 'var(--color-accent)' }}>+ ADD SHOT</strong> to build your shot list.
              Rows are in shoot order — optimise by location.
            </span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
            {/* Column headers */}
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--color-border-subtle)', background: 'var(--color-surface)' }}>
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => ['shotNumber','location','shotType','estimatedSetupMinutes'].includes(col.key)
                      ? handleSort(col.key as SortKey)
                      : undefined
                    }
                    style={{
                      ...headerCellStyle,
                      width: col.flex ? undefined : col.width,
                      textAlign: 'left',
                      padding: '9px 8px',
                      fontWeight: 500,
                      cursor: ['shotNumber','location','shotType','estimatedSetupMinutes'].includes(col.key) ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {col.label}
                      {['shotNumber','location','shotType','estimatedSetupMinutes'].includes(col.key) && (
                        <SortIcon col={col.key as SortKey} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map(shot => {
                const sceneInfo = sceneMap[shot.sceneId]
                const isHovered = hoveredRow === shot.id
                return (
                  <tr
                    key={shot.id}
                    onMouseEnter={() => setHoveredRow(shot.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: '0.5px solid var(--color-border-subtle)',
                      background: isHovered ? 'var(--color-surface)' : 'transparent',
                      transition: 'background 100ms',
                    }}
                  >
                    {/* Shot # */}
                    <td style={{ ...cellStyle, width: 48, padding: '8px 8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: shot.needsReview ? 'var(--color-warning)' : 'var(--color-accent)',
                        fontWeight: 600,
                      }}>
                        {String(shot.shotNumber).padStart(2, '0')}
                        {shot.needsReview && <IconAlertTriangle size={9} />}
                      </span>
                    </td>

                    {/* Scene */}
                    <td style={{ ...cellStyle, width: 80 }}>
                      {sceneInfo ? (
                        <span style={{ color: 'var(--color-text-tertiary)' }}>
                          SC {String(sceneInfo.index + 1).padStart(2, '0')}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-danger)', fontSize: '0.5rem' }}>—</span>
                      )}
                    </td>

                    {/* INT/EXT */}
                    <td style={{ ...cellStyle, width: 70, color: 'var(--color-text-tertiary)' }}>{shot.intExt}</td>

                    {/* Location */}
                    <td style={{ ...cellStyle, width: 130 }}>{shot.location || '—'}</td>

                    {/* Shot type */}
                    <td style={{ ...cellStyle, width: 70 }}>
                      <span style={{
                        background: 'var(--color-surface-raised)',
                        padding: '1px 5px',
                        borderRadius: 3,
                        color: 'var(--color-text-primary)',
                      }}>
                        {shot.shotType}
                      </span>
                    </td>

                    {/* Movement */}
                    <td style={{ ...cellStyle, width: 90, color: 'var(--color-text-tertiary)' }}>{shot.movement}</td>

                    {/* Lens */}
                    <td style={{ ...cellStyle, width: 60, color: 'var(--color-text-tertiary)' }}>{shot.lens}mm</td>

                    {/* Description */}
                    <td style={{ ...cellStyle, maxWidth: 240, color: 'var(--color-text-secondary)' }}>
                      {shot.description || <span style={{ opacity: 0.3 }}>—</span>}
                    </td>

                    {/* Cast */}
                    <td style={{ ...cellStyle, width: 100, color: 'var(--color-text-tertiary)' }}>
                      {shot.cast.length > 0 ? shot.cast.join(', ') : '—'}
                    </td>

                    {/* Equipment */}
                    <td style={{ ...cellStyle, width: 90, color: 'var(--color-text-tertiary)' }}>
                      {shot.specialEquipment || '—'}
                    </td>

                    {/* Setup */}
                    <td style={{ ...cellStyle, width: 60, color: 'var(--color-text-tertiary)' }}>
                      {shot.estimatedSetupMinutes}m
                    </td>

                    {/* Actions */}
                    <td style={{ width: 60, padding: '0 8px' }}>
                      {isHovered && (
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditingShot(shot)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', lineHeight: 0, padding: 3 }}
                          >
                            <IconEdit size={12} />
                          </button>
                          <button
                            onClick={() => deleteShot(shot.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', lineHeight: 0, padding: 3 }}
                          >
                            <IconTrash size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add shot modal */}
      {addingShot && (
        <ShotModal
          shot={null}
          scenes={projectScenes}
          projectId={project.id}
          onSave={handleAddShot}
          onClose={() => setAddingShot(false)}
          mode="add"
        />
      )}

      {/* Edit shot modal */}
      {editingShot && (
        <ShotModal
          shot={editingShot}
          scenes={projectScenes}
          projectId={project.id}
          onSave={handleEditShot}
          onClose={() => setEditingShot(null)}
          mode="edit"
        />
      )}
    </div>
  )
}
