import { Link } from 'react-router-dom'
import { BellRing, Menu, ClipboardList } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/format'

function greeting() {
  const h = new Date().getHours()
  if (h < 5 || h >= 18) return 'Bonsoir'
  return 'Bonjour'
}

export default function Topbar({ title, alertHref, alertCount, pendingHref, pendingCount, onMenu }) {
  const { currentUser } = useAuth()
  const prenom = currentUser?.nom?.split(' ')[0]
  const todayRaw = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const today = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1)

  return (
    <header className="no-print glass sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line/70 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink shadow-soft transition-transform active:scale-95 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu size={19} aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {greeting()}
            {prenom ? `, ${prenom}` : ''} <span aria-hidden="true">👋</span>
          </p>
          <p className="truncate text-xs text-muted">
            {title} · {today}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {pendingHref ? (
          <Link
            to={pendingHref}
            className={`group relative flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold shadow-soft transition-colors ${
              pendingCount
                ? 'border-gold/40 bg-gold-bg text-gold-2 hover:bg-gold-bg/70'
                : 'border-line bg-surface text-muted hover:text-ink'
            }`}
            title="Demandes en attente"
            aria-label={pendingCount ? `${pendingCount} demande${pendingCount > 1 ? 's' : ''} en attente` : 'Aucune demande en attente'}
          >
            <span className="relative flex">
              {pendingCount ? <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" aria-hidden="true" /> : null}
              <ClipboardList size={17} className="relative" aria-hidden="true" />
            </span>
            <span key={pendingCount} className="animate-pop tabular">{pendingCount || 0}</span>
            <span className="hidden md:inline">en attente</span>
          </Link>
        ) : null}
        {alertHref ? (
          <Link
            to={alertHref}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted shadow-soft transition-colors hover:text-ink"
            title="Alertes stock"
            aria-label={alertCount ? `Alertes stock : ${alertCount}` : 'Alertes stock'}
          >
            <BellRing size={18} className="transition-transform group-hover:rotate-12" aria-hidden="true" />
            {alertCount ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[0.65rem] font-bold text-white ring-2 ring-surface">
                {alertCount}
              </span>
            ) : null}
          </Link>
        ) : null}
        {currentUser ? (
          <div
            className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ink-3 to-ink text-xs font-bold text-gold-soft shadow-soft sm:flex"
            title={currentUser.nom}
            aria-hidden="true"
          >
            {initials(currentUser.nom)}
          </div>
        ) : null}
      </div>
    </header>
  )
}
