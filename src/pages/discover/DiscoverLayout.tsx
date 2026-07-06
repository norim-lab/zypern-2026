// DiscoverLayout.tsx — Gemeinsames Layout für alle Entdecken-Untertabs.
// SubTabs + Standort-Chip oben, <Outlet/> darunter.
import { Outlet } from 'react-router-dom'
import { SubTabs } from '@/components/ui/SubTabs'
import { LocationChip } from '@/components/discover/LocationChip'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useGeolocation } from '@/hooks/useGeolocation'
import { GeolocationContext } from './geolocationContext'

const TABS = [
  { to: '/entdecken', label: 'Strände', icon: '🏖️', end: true },
  { to: '/entdecken/ausfluege', label: 'Ausflüge', icon: '🗺️' },
  { to: '/entdecken/essen', label: 'Essen', icon: '🍽️' },
  { to: '/entdecken/einkaufen', label: 'Einkaufen', icon: '🛒' },
  { to: '/entdecken/events', label: 'Events', icon: '🎉' },
  { to: '/entdecken/news', label: 'News', icon: '📰' },
]

export function DiscoverLayout() {
  const geo = useGeolocation()
  return (
    <div className="p-4 pb-24">
      <SectionTitle icon="🧭">Entdecken</SectionTitle>
      <GeolocationContext.Provider value={geo}>
        <SubTabs items={TABS} />
        <LocationChip
          location={geo.location}
          source={geo.source}
          loading={geo.loading}
          onRefresh={geo.refresh}
        />
        <Outlet />
      </GeolocationContext.Provider>
    </div>
  )
}
