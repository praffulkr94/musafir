import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { Plus } from 'lucide-react'
import { Toaster } from 'sonner'
import * as Tooltip from '@radix-ui/react-tooltip'
import './AppShell.css'

export function AppShell() {
  const { pathname } = useLocation()
  const placesActive = pathname.startsWith('/places')

  return (
    <Tooltip.Provider delayDuration={200}>
      <header className="app-header">
        <div className="container app-header-inner">
          <Link to="/" className="wordmark" aria-label="Musafir home">
            Musafir
          </Link>
          <nav className="app-nav" aria-label="Primary">
            <NavLink to="/" end className="app-nav-link">
              Home
            </NavLink>
            <NavLink to="/places" className={() => `app-nav-link${placesActive ? ' active' : ''}`}>
              My Places
            </NavLink>
          </nav>
          <Link to="/create" className="btn btn-primary app-create">
            <Plus size={20} strokeWidth={2} aria-hidden="true" />
            <span className="app-create-label">Create Memory</span>
            <span className="app-create-label-sr">Create Memory</span>
          </Link>
        </div>
      </header>
      <main className="app-main" id="main">
        <Outlet />
      </main>
      <Toaster
        position="bottom-center"
        offset={24}
        toastOptions={{
          duration: 3200,
          style: { background: '#222222', color: '#ffffff', border: 'none', borderRadius: 8, fontFamily: 'inherit' },
        }}
      />
      <ScrollRestoration />
    </Tooltip.Provider>
  )
}
