// App.tsx — Layout-Shell: Header + Scroll-Content (Outlet) + BottomNav.
// v0.3: PWA-Update-Banner + Offline-Banner integriert.
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { PwaUpdateBanner } from '@/components/layout/PwaUpdateBanner'
import { OfflineBanner } from '@/components/layout/OfflineBanner'

export default function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-zypern-sand-light dark:bg-slate-900">
      <PwaUpdateBanner />
      <OfflineBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
