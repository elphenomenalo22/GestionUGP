import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({ items, roleLabel, alertHref, alertCount, pendingHref, pendingCount, before }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-dvh">
      {before}
      <Sidebar items={items} roleLabel={roleLabel} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="scroll-thin flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar
          title={roleLabel}
          alertHref={alertHref}
          alertCount={alertCount}
          pendingHref={pendingHref}
          pendingCount={pendingCount}
          onMenu={() => setMenuOpen(true)}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div key={location.pathname} className="animate-fade-in mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
