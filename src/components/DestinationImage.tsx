import { useEffect, useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import type { Memory, Photo } from '../types'
import { useMemories } from '../store/memories'
import { forgetDestinationPhoto, resolveDestinationPhoto } from '../lib/imagery'
import './DestinationImage.css'

type Props = {
  memory: Pick<
    Memory,
    | 'id'
    | 'placeName'
    | 'country'
    | 'latitude'
    | 'longitude'
    | 'imageUrl'
    | 'imagePhotographer'
    | 'imageSourceUrl'
    | 'imageSource'
    | 'imageLicense'
  >
  /** Show the photographer credit (Place Details, country preview). */
  credit?: boolean
  className?: string
  sizes?: string
}

type MemoryPhotoFields = Props['memory']

const storedPhoto = (m: MemoryPhotoFields): Photo | null =>
  m.imageUrl
    ? {
        imageUrl: m.imageUrl,
        imagePhotographer: m.imagePhotographer ?? '',
        imageSourceUrl: m.imageSourceUrl ?? '',
        imageSource: m.imageSource ?? 'pexels',
        imageLicense: m.imageLicense,
      }
    : null

/**
 * Finds the photo for a memory, looking one up when the memory was saved
 * without one (older memories, or a lookup that failed at the time) and
 * writing it back so it stays put.
 */
function useDestinationPhoto(memory: MemoryPhotoFields) {
  const setMemoryPhoto = useMemories((s) => s.setMemoryPhoto)
  const { id, placeName, country, latitude, longitude } = memory

  // URLs that 404'd in this session: never shown again, however they arrive.
  const [rejected, setRejected] = useState<readonly string[]>([])
  const [attempt, setAttempt] = useState(0)
  const [resolved, setResolved] = useState<{ token: string; photo: Photo | null } | null>(null)

  const usable = (photo: Photo | null) => (photo && !rejected.includes(photo.imageUrl) ? photo : null)

  const saved = usable(storedPhoto(memory))
  const query = { placeName, country, latitude, longitude }
  const token = `${id}|${placeName}|${country}|${latitude},${longitude}|${attempt}`
  // undefined while the lookup for this token is still in flight.
  const found = resolved?.token === token ? resolved.photo : undefined

  const photo = saved ?? usable(found ?? null)
  const loading = !saved && found === undefined

  const savedUrl = saved?.imageUrl
  useEffect(() => {
    if (savedUrl) return
    let active = true
    resolveDestinationPhoto(query).then((next) => {
      if (!active) return
      setResolved({ token, photo: next })
      if (next && !rejected.includes(next.imageUrl)) setMemoryPhoto(id, next)
    })
    return () => {
      active = false
    }
    // `query` is rebuilt each render; `token` carries the same identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id, savedUrl, rejected, setMemoryPhoto])

  /** The URL is stale: drop it and try one fresh lookup for this place. */
  const handleBroken = () => {
    if (!photo) return
    setRejected((all) => (all.includes(photo.imageUrl) ? all : [...all, photo.imageUrl]))
    forgetDestinationPhoto(query)
    setAttempt((n) => n + 1)
  }

  return { photo, loading, handleBroken }
}

/** One destination photo with a calm placeholder when none is available. */
export function DestinationImage({ memory, credit = false, className = '' }: Props) {
  const { photo, loading, handleBroken } = useDestinationPhoto(memory)

  if (loading) {
    return (
      <div className={`destination-image is-loading ${className}`} role="img" aria-label={`Finding a photo of ${memory.placeName}`} />
    )
  }

  if (!photo) {
    return (
      <div className={`destination-image is-placeholder ${className}`} role="img" aria-label={`No photo for ${memory.placeName}`}>
        <ImageIcon size={22} strokeWidth={1.75} aria-hidden="true" />
        <span className="destination-image-placeholder-label">{memory.placeName}</span>
      </div>
    )
  }

  return (
    <figure className={`destination-image ${className}`}>
      <img
        src={photo.imageUrl}
        alt={`${memory.placeName}, ${memory.country}`}
        loading="lazy"
        decoding="async"
        onError={handleBroken}
      />
      {credit && <PhotoCredit photo={photo} />}
    </figure>
  )
}

function PhotoCredit({ photo }: { photo: Photo }) {
  const site = photo.imageSource === 'wikimedia' ? 'Wikimedia Commons' : 'Pexels'
  const author = photo.imagePhotographer

  return (
    <figcaption className="destination-image-credit">
      {author ? <>Photo by {author} · </> : 'Photo · '}
      {photo.imageSourceUrl ? (
        <a href={photo.imageSourceUrl} target="_blank" rel="noreferrer">
          {site}
        </a>
      ) : (
        site
      )}
      {photo.imageLicense ? ` (${photo.imageLicense})` : ''}
    </figcaption>
  )
}
