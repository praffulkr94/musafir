import { useEffect, useRef } from 'react'
import './ConfirmDialog.css'

type Props = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/** Lightweight confirmation built on the native <dialog>, which supplies focus trapping and Escape. */
export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div className="confirm-dialog-body">
        <h2 id="confirm-title" className="display-sm">
          {title}
        </h2>
        <p id="confirm-desc" className="body-sm text-muted">
          {description}
        </p>
        <div className="confirm-dialog-actions">
          {/* Focus lands on the safe action; Enter never deletes by accident. */}
          <button type="button" className="btn btn-secondary" onClick={onCancel} autoFocus>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
