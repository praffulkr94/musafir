import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useMemories } from '../store/memories'
import { MemoryForm } from '../components/MemoryForm'

export function CreateMemoryPage() {
  const navigate = useNavigate()
  const addMemory = useMemories((s) => s.addMemory)

  return (
    <div className="container page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Back to Home
      </Link>
      <div className="page-header" style={{ marginBottom: 40 }}>
        <div>
          <h1 className="display-xl">Create a Memory</h1>
          <p>Add a place you have visited.</p>
        </div>
      </div>
      <MemoryForm
        submitLabel="Save Memory"
        onCancel={() => navigate(-1)}
        onSubmit={(input) => {
          const memory = addMemory(input)
          toast.success('Memory created', { description: `${memory.placeName}, ${memory.country}` })
          navigate('/')
        }}
      />
    </div>
  )
}
