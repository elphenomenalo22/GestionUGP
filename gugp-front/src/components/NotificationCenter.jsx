import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, PackageX, X, BellRing } from 'lucide-react'
import { getToken } from '../api/httpClient'
import { useAppData } from '../context/AppDataContext'
import { playNotificationSound } from '../utils/notificationSound'
import { pushSupported, subscribeToPush } from '../utils/pushSubscription'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4010/api'
const AUTO_DISMISS_MS = 15000
// Vérification de secours : si le flux temps réel est coupé (mise en veille
// du serveur, réseau mobile…), les nouvelles demandes arrivent quand même.
const POLL_MS = 45000
const BASE_TITLE = 'G-UGP - Gestion des stocks et expressions de besoins'

/**
 * Prévient le gestionnaire, sans action du demandeur, qu'une expression de
 * besoin attend sa décision :
 *  - alerte visuelle et sonore dans l'application ;
 *  - mise à jour automatique des listes et des compteurs ;
 *  - nombre de demandes en attente dans le titre de l'onglet et sur l'icône
 *    de l'application installée ;
 *  - notification navigateur (push), même application fermée, si acceptée.
 * Un e-mail est en plus envoyé par l'API à chaque nouvelle demande.
 */
export default function NotificationCenter() {
  const { demandes, loaded, findUser, refreshDemandes, refreshArticles } = useAppData()
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)
  const seenPending = useRef(null)
  const refreshRef = useRef({ refreshDemandes, refreshArticles })
  const [showPrompt, setShowPrompt] = useState(() => {
    try {
      return pushSupported() && Notification.permission === 'default' && !sessionStorage.getItem('gugp_push_prompt_dismissed')
    } catch {
      return false
    }
  })

  useEffect(() => {
    refreshRef.current = { refreshDemandes, refreshArticles }
  })

  function pushToast(toast) {
    const id = nextId.current++
    setToasts((prev) => [...prev.slice(-3), { id, ...toast }])
    playNotificationSound()
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), AUTO_DISMISS_MS)
  }

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  async function enablePush() {
    setShowPrompt(false)
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      try {
        await subscribeToPush()
      } catch (err) {
        console.error('Abonnement aux notifications push impossible :', err)
      }
    }
  }

  function dismissPrompt() {
    try {
      sessionStorage.setItem('gugp_push_prompt_dismissed', '1')
    } catch {
      /* stockage indisponible : on masque simplement l'invite */
    }
    setShowPrompt(false)
  }

  // Les nouvelles demandes sont détectées à partir des données elles-mêmes :
  // qu'elles arrivent par le flux temps réel ou par la vérification
  // périodique, chaque demande ne déclenche qu'une seule alerte.
  const pending = demandes.filter((d) => d.statut === 'en_attente')
  useEffect(() => {
    if (!loaded) return
    const ids = pending.map((d) => d.id)
    if (seenPending.current === null) {
      seenPending.current = new Set(ids)
      return
    }
    const nouvelles = pending.filter((d) => !seenPending.current.has(d.id))
    ids.forEach((id) => seenPending.current.add(id))
    nouvelles.forEach((d) => {
      const demandeur = findUser(d.demandeurId)
      pushToast({
        icon: ClipboardList,
        title: 'Nouvelle expression de besoin',
        body: [demandeur?.nom, d.numero, d.programmeNom].filter(Boolean).join(' · '),
        href: `/gestion/demandes/${d.id}`,
        action: 'Traiter',
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandes, loaded])

  // Compteur dans le titre de l'onglet et sur l'icône de l'application installée.
  const pendingCount = pending.length
  useEffect(() => {
    document.title = pendingCount > 0 ? `(${pendingCount}) ${BASE_TITLE}` : BASE_TITLE
    try {
      if (pendingCount > 0) navigator.setAppBadge?.(pendingCount)?.catch?.(() => {})
      else navigator.clearAppBadge?.()?.catch?.(() => {})
    } catch {
      /* API de badge non prise en charge */
    }
  }, [pendingCount])

  useEffect(
    () => () => {
      document.title = BASE_TITLE
      try {
        navigator.clearAppBadge?.()?.catch?.(() => {})
      } catch {
        /* rien */
      }
    },
    []
  )

  // Flux temps réel (SSE) : dès qu'une demande est créée, on recharge la liste.
  useEffect(() => {
    const token = getToken()
    if (!token) return

    const source = new EventSource(`${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`)
    source.onmessage = (e) => {
      let event
      try {
        event = JSON.parse(e.data)
      } catch {
        return
      }
      if (event.type === 'demande.created') {
        refreshRef.current.refreshDemandes().catch(() => {})
      } else if (event.type === 'stock.depleted') {
        refreshRef.current.refreshArticles().catch(() => {})
        pushToast({
          icon: PackageX,
          tone: 'danger',
          title: 'Rupture de stock',
          body: `${event.designation} n'a plus de stock disponible.`,
          href: '/gestion/alertes',
          action: 'Voir',
        })
      }
    }
    return () => source.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Vérification périodique + au retour sur l'onglet.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') refreshRef.current.refreshDemandes().catch(() => {})
    }
    const timer = setInterval(refresh, POLL_MS)
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('online', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('online', refresh)
    }
  }, [])

  return (
    <div
      className="no-print pointer-events-none fixed inset-x-0 top-[4.5rem] z-[100] flex flex-col items-center gap-2.5 px-3 sm:inset-x-auto sm:right-4 sm:items-end"
      aria-live="polite"
    >
      {showPrompt ? (
        <div className="animate-notification-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-lift">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-bg text-gold">
            <BellRing size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Être alerté des nouvelles demandes ?</p>
            <p className="mt-0.5 text-xs text-muted">
              Recevez une notification dès qu'une expression de besoin est soumise, même quand l'application est fermée.
            </p>
            <div className="mt-2.5 flex gap-2">
              <button onClick={enablePush} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-3">
                Activer
              </button>
              <button onClick={dismissPrompt} className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted hover:bg-paper-2 hover:text-ink">
                Plus tard
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toasts.map(({ id, icon: Icon, tone, title, body, href, action }) => (
        <div
          key={id}
          role="status"
          className="animate-notification-in pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border border-white/10 bg-ink px-4 py-3.5 text-white shadow-[0_20px_50px_-12px_rgb(11_17_34/0.7)]"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-gold/30 blur-2xl" />
          <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone === 'danger' ? 'bg-danger/25' : 'bg-gold/20'}`}>
            <span className={`absolute inset-0 animate-ping rounded-xl ${tone === 'danger' ? 'bg-danger/30' : 'bg-gold/30'}`} aria-hidden="true" />
            <Icon size={18} className={`relative ${tone === 'danger' ? 'text-white' : 'text-gold-soft'}`} aria-hidden="true" />
          </div>
          <div className="relative min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-0.5 truncate text-xs text-white/70">{body}</p>
            <Link
              to={href}
              onClick={() => dismiss(id)}
              className="mt-2 inline-flex items-center rounded-lg bg-gradient-to-b from-gold-soft to-gold px-3 py-1 text-xs font-bold text-ink-2"
            >
              {action}
            </Link>
          </div>
          <button
            onClick={() => dismiss(id)}
            className="relative flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Fermer la notification"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
