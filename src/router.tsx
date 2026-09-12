import { createBrowserRouter } from 'react-router'
import { AppShell } from './components/AppShell'
import { HomePage } from './pages/HomePage'
import { CreateMemoryPage } from './pages/CreateMemoryPage'
import { EditMemoryPage } from './pages/EditMemoryPage'
import { MyPlacesPage } from './pages/MyPlacesPage'
import { PlaceDetailsPage } from './pages/PlaceDetailsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: HomePage },
      { path: 'create', Component: CreateMemoryPage },
      { path: 'places', Component: MyPlacesPage },
      { path: 'places/:id', Component: PlaceDetailsPage },
      { path: 'places/:id/edit', Component: EditMemoryPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
