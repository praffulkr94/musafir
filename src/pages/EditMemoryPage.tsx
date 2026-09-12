import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useMemories } from '../store/memories'
import { MemoryForm } from '../components/MemoryForm'
import { NotFoundPage } from './NotFoundPage'

export function EditMemoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const memory = useMemories((s) => s.memories.find((m) => m.id === id))
  const updateMemory = useMemories((s) => s.updateMemory)

  if (!memory) return <NotFoundPage />

  const from = (location.state as { from?: string } | null)?.from
  const backTo = from === 'details' ? `/places/${memory.id}` : '/places'
  const backLabel = from === 'details' ? 'Back to memory' : 'Back to My Places'

  return (
    <div className="container page">
      <Link to={backTo} className="back-link">
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        {backLabel}
      </Link>
      <div className="page-header" style={{ marginBottom: 40 }}>
        <div>
          <h1 className="display-xl">Edit Memory</h1>
          <p>Update your travel details.</p>
        </div>
      </div>
      <MemoryForm
        key={memory.id}
        initial={memory}
        submitLabel="Update Memory"
        onCancel={() => navigate(backTo)}
        onSubmit={(input) => {
          updateMemory(memory.id, input)
          toast.success('Memory updated', { description: `${input.placeName}, ${input.country}` })
          navigate(backTo)
        }}
      />
    </div>
  )
}
