// App.tsx — Layout-Shell: Header + Scroll-Content (Outlet) + BottomNav.
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-zypern-sand-light dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
