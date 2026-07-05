// main.tsx — Einstieg: Theme-Bootstrap + Routing + PWA-Service-Worker.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { Dashboard } from '@/pages/Dashboard'
import { Flights } from '@/pages/Flights'
import { Accommodation } from '@/pages/Accommodation'
import { RentalCar } from '@/pages/RentalCar'
import { Lists } from '@/pages/Lists'
import { More } from '@/pages/More'
import { DiscoverLayout } from '@/pages/discover/DiscoverLayout'
import { Beaches } from '@/pages/discover/Beaches'
import { Excursions } from '@/pages/discover/Excursions'
import { Food } from '@/pages/discover/Food'
import { Events } from '@/pages/discover/Events'
import { News } from '@/pages/discover/News'
import { Archive } from '@/pages/Archive'

// Service Worker registrieren (Auto-Update, Offline-Caching).
registerSW({ immediate: true })

// Bottom-Tab-Routing (6 Tabs).
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'fluege', element: <Flights /> },
      { path: 'wohnen', element: <Accommodation /> },
      { path: 'auto', element: <RentalCar /> },
      {
        path: 'entdecken',
        element: <DiscoverLayout />,
        children: [
          { index: true, element: <Beaches /> },
          { path: 'ausfluege', element: <Excursions /> },
          { path: 'essen', element: <Food /> },
          { path: 'events', element: <Events /> },
          { path: 'news', element: <News /> },
        ],
      },
      { path: 'listen', element: <Lists /> },
      { path: 'mehr', element: <More /> },
      { path: 'archiv', element: <Archive /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
