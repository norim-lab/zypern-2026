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
      { path: 'listen', element: <Lists /> },
      { path: 'mehr', element: <More /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
