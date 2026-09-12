import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useMemories } from '../store/memories'
import { formatCoordinates, formatDateRange } from '../lib/dates'
import { DestinationImage } from '../components/DestinationImage'
import { PlaceMap } from '../components/PlaceMap'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { NotFoundPage } from './NotFoundPage'
import './PlaceDetailsPage.css'

export function PlaceDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const memory = useMemories((s) => s.memories.find((m) => m.id === id))
  const deleteMemory = useMemories((s) => s.deleteMemory)
  const [confirming, setConfirming] = useState(false)

  if (!memory) return <NotFoundPage />

  const confirmDelete = () => {
    deleteMemory(memory.id)
    setConfirming(false)
    toast.success('Memory deleted', { description: `${memory.placeName}, ${memory.country}` })
    navigate('/places', { replace: true })
  }

  return (
    <div className="container page">
      <Link to="/places" className="back-link">
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Back to My Places
      </Link>

      <div className="details-header">
        <div className="details-heading">
          <h1 className="display-xl">
            {memory.placeName}, {memory.country}
          </h1>
          <div className="text-body">{formatDateRange(memory.startDate, memory.endDate)}</div>
          <div className="body-sm text-muted details-meta">
            {memory.displayName ?? `${memory.placeName}, ${memory.country}`} ·{' '}
            <span style={{ whiteSpace: 'nowrap' }}>{formatCoordinates(memory.latitude, memory.longitude)}</span>
          </div>
        </div>
        <div className="details-actions">
          <Link to={`/places/${memory.id}/edit`} state={{ from: 'details' }} className="btn btn-secondary">
            Edit
          </Link>
          <button type="button" className="btn btn-danger-outline" onClick={() => setConfirming(true)}>
            Delete
          </button>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-panel">
          <DestinationImage memory={memory} credit />
        </div>
        <div className="details-panel is-map">
          <PlaceMap latitude={memory.latitude} longitude={memory.longitude} zoom={10} label={`${memory.placeName}, ${memory.country}`} />
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Delete this memory?"
        description={`${memory.placeName}, ${memory.country} will be removed from your places. This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}
