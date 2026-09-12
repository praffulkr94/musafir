import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="container page" style={{ textAlign: 'center', paddingTop: 96 }}>
      <h1 className="display-xl">This memory isn't here</h1>
      <p className="text-muted" style={{ marginTop: 4 }}>
        It may have been deleted, or the link is wrong.
      </p>
      <Link to="/places" className="btn btn-secondary" style={{ marginTop: 24 }}>
        Go to My Places
      </Link>
    </div>
  )
}
