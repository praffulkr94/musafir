import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Memory } from '../types'
import { useMemories } from '../store/memories'
import { sortByMostRecent } from '../lib/derived'
import { formatDateRange } from '../lib/dates'
import { DestinationImage } from '../components/DestinationImage'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Tip } from '../components/Tip'
import './MyPlacesPage.css'

export function MyPlacesPage() {
  const memories = useMemories((s) => s.memories)
  const deleteMemory = useMemories((s) => s.deleteMemory)
  const navigate = useNavigate()
  const [pendingDelete, setPendingDelete] = useState<Memory | null>(null)
  const rows = sortByMostRecent(memories)

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteMemory(pendingDelete.id)
    toast.success('Memory deleted', { description: `${pendingDelete.placeName}, ${pendingDelete.country}` })
    setPendingDelete(null)
  }

  return (
    <div className="container page">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="display-xl">My Places</h1>
          <p>All the places you have visited.</p>
        </div>
        {rows.length > 0 && (
          <div className="body-sm text-muted">
            {rows.length} {rows.length === 1 ? 'place' : 'places'}
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="places-empty">
          <div className="title-md">No places yet</div>
          <p className="text-muted">Your first memory will appear here.</p>
          <Link to="/create" className="btn btn-primary">
            <Plus size={20} strokeWidth={2} aria-hidden="true" />
            Create Memory
          </Link>
        </div>
      ) : (
        <ul className="places-list">
          {rows.map((m) => (
            <li key={m.id} className="place-row">
              <Link to={`/places/${m.id}`} className="place-row-thumb" aria-hidden="true" tabIndex={-1}>
                <DestinationImage memory={m} />
              </Link>
              <div className="place-row-text">
                <Link to={`/places/${m.id}`} className="place-row-title title-md">
                  {m.placeName}
                </Link>
                <div className="body-sm text-muted">{m.country}</div>
                <div className="body-sm text-body place-row-dates">{formatDateRange(m.startDate, m.endDate)}</div>
              </div>
              <div className="place-row-actions">
                <button
                  type="button"
                  className="btn btn-text"
                  onClick={() => navigate(`/places/${m.id}/edit`, { state: { from: 'places' } })}
                  aria-label={`Edit ${m.placeName}`}
                >
                  Edit
                </button>
                <button type="button" className="btn btn-text is-danger" onClick={() => setPendingDelete(m)} aria-label={`Delete ${m.placeName}`}>
                  Delete
                </button>
                <Tip label="View memory">
                  <Link to={`/places/${m.id}`} className="icon-btn" aria-label={`View ${m.placeName}`}>
                    <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                  </Link>
                </Tip>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this memory?"
        description={
          pendingDelete
            ? `${pendingDelete.placeName}, ${pendingDelete.country} will be removed from your places. This can't be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
