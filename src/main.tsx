// main.tsx — Einstieg: Theme-Bootstrap + Routing + PWA-Service-Worker.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { startRefreshScheduler } from '@/lib/refreshScheduler'
import './index.css'
import App from './App.tsx'
import { lazy } from 'react'
import { LazyTab } from '@/components/layout/LazyTab'
import { Dashboard } from '@/pages/Dashboard'
import { Flights } from '@/pages/Flights'
import { Accommodation } from '@/pages/Accommodation'
import { RentalCar } from '@/pages/RentalCar'
import { Lists } from '@/pages/Lists'
import { More } from '@/pages/More'
import { DiscoverLayout } from '@/pages/discover/DiscoverLayout'
// v0.3 Code-Splitting: Entdecken-Untertabs + Archiv werden lazy geladen.
const Beaches = lazy(() => import('@/pages/discover/Beaches').then((m) => ({ default: m.Beaches })))
const Excursions = lazy(() => import('@/pages/discover/Excursions').then((m) => ({ default: m.Excursions })))
const Food = lazy(() => import('@/pages/discover/Food').then((m) => ({ default: m.Food })))
const Shopping = lazy(() => import('@/pages/discover/Shopping').then((m) => ({ default: m.Shopping })))
const Events = lazy(() => import('@/pages/discover/Events').then((m) => ({ default: m.Events })))
const News = lazy(() => import('@/pages/discover/News').then((m) => ({ default: m.News })))
const WeatherDetail = lazy(() => import('@/pages/WeatherDetail').then((m) => ({ default: m.WeatherDetail })))
const Archive = lazy(() => import('@/pages/Archive').then((m) => ({ default: m.Archive })))

// v0.3: SW-Registrierung erfolgt jetzt React-seitig via PwaUpdateBanner
// (useRegisterSW mit Update-Banner). Imperatives registerSW entfällt.
// Refresh-Scheduler starten (stündlich/30min/5min + Fokus + Online,
// pausiert im Hintergrund für Akkuschonung).
startRefreshScheduler()

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
          { index: true, element: <LazyTab component={Beaches} tabName="Strände" /> },
          { path: 'ausfluege', element: <LazyTab component={Excursions} tabName="Ausflüge" /> },
          { path: 'essen', element: <LazyTab component={Food} tabName="Essen" /> },
          { path: 'einkaufen', element: <LazyTab component={Shopping} tabName="Einkaufen" /> },
          { path: 'events', element: <LazyTab component={Events} tabName="Events" /> },
          { path: 'news', element: <LazyTab component={News} tabName="News" /> },
        ],
      },
      { path: 'listen', element: <Lists /> },
      { path: 'mehr', element: <More /> },
      { path: 'wetter', element: <LazyTab component={WeatherDetail} tabName="Wetter" /> },
      { path: 'archiv', element: <LazyTab component={Archive} tabName="Archiv" /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
