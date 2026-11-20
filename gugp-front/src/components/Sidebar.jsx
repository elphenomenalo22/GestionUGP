import { NavLink } from 'react-router-dom'
import { LogOut, KeyRound, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import { initials } from '../utils/format'


export default function Sidebar({ items, roleLabel, isOpen, onClose }) {
  const { currentUser, logout } = useAuth()

  return (
    <>
      {/* Voile mobile */}
      {isOpen ? (
        <div className="animate-fade-in fixed inset-0 z-[45] bg-ink-2/50 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />
      ) : null}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-[17rem] shrink-0 flex-col overflow-hidden bg-ink text-white/90 transition-transform duration-300 ease-[var(--ease-out-soft)] lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Décor lumineux */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-[#4f62b4]/25 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
        </div>

        <div className="relative flex items-center justify-between gap-2.5 px-5 pb-6 pt-6">
          <div className="flex items-center gap-3">
            <Logo size={38} className="drop-shadow-[0_6px_14px_rgb(0_0_0/0.35)]" />
            <div>
              <p className="text-[1.05rem] font-bold leading-none tracking-tight text-white">G-UGP</p>
              <p className="mt-1.5 text-[0.7rem] font-medium uppercase leading-none tracking-[0.12em] text-gold-soft/80">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="scroll-thin relative flex-1 space-y-1 overflow-y-auto px-3" aria-label="Navigation principale">
          {items.map(({ to, label, icon: Icon, badge, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]'
                    : 'text-white/60 hover:translate-x-0.5 hover:bg-white/[0.05] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-gold-soft to-gold transition-all duration-300 ${
                      isActive ? 'opacity-100' : 'scale-y-0 opacity-0'
                    }`}
                  />
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        isActive ? 'bg-gradient-to-br from-gold-soft/25 to-gold/10 text-gold-soft' : 'text-white/55 group-hover:text-white'
                      }`}
                    >
                      <Icon size={17} strokeWidth={2} aria-hidden="true" />
                    </span>
                    {label}
                  </span>
                  {badge ? (
                    <span className="min-w-5 rounded-full bg-gradient-to-b from-gold-soft to-gold px-1.5 py-0.5 text-center text-[0.7rem] font-bold leading-none text-ink-2 shadow-[0_2px_8px_-2px_rgb(242_199_110/0.6)]">
                      {badge}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative p-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.05] p-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-soft to-gold text-xs font-bold text-ink-2">
                {initials(currentUser.nom)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{currentUser.nom}</p>
                <p className="truncate text-xs text-white/50">{currentUser.poste}</p>
              </div>
              <NavLink
                to="/mot-de-passe"
                onClick={onClose}
                title="Changer le mot de passe"
                aria-label="Changer le mot de passe"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <KeyRound size={15} aria-hidden="true" />
              </NavLink>
              <button
                onClick={() => {
                  logout()
                  onClose()
                }}
                title="Se déconnecter"
                aria-label="Se déconnecter"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-danger/25 hover:text-white"
              >
                <LogOut size={15} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  )
}
