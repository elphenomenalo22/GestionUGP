import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  ChevronRight,
  Boxes,
  TriangleAlert,
  Clock3,
  CircleCheck,
  XCircle,
  ArrowUpFromLine,
  ArrowRight,
  Sparkles,
  CircleCheckBig,
  Inbox,
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { stockLevel, stockLevelConfig } from '../../utils/status'
import { formatDate, formatNumber, uniteLabel } from '../../utils/format'
import { useCountUp } from '../../utils/useCountUp'
import StatusPill from '../../components/StatusPill'
import StockGauge from '../../components/StockGauge'

const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

const tones = {
  ink: 'from-ink-3 to-ink text-gold-soft',
  danger: 'from-danger/15 to-danger/5 text-danger',
  warn: 'from-warn/15 to-warn/5 text-warn',
  ok: 'from-ok/15 to-ok/5 text-ok',
  gold: 'from-gold/20 to-gold/5 text-gold-2',
}

function StatCard({ label, value, suffix, href, icon: Icon, tone }) {
  const animated = useCountUp(value)
  return (
    <Link
      to={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-soft transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]}`}>
          <Icon size={19} strokeWidth={2} aria-hidden="true" />
        </span>
        <ArrowRight
          size={16}
          className="-translate-x-1 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tabular tracking-tight text-ink sm:text-[1.75rem]">
          {formatNumber(animated)}
          {suffix ? <span className="ml-1 text-xs font-medium text-muted">{suffix}</span> : null}
        </p>
        <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
      </div>
    </Link>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-surface/95 px-3 py-2 text-xs shadow-lift backdrop-blur">
      <p className="mb-1 font-semibold text-ink">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-muted">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} aria-hidden="true" />
          {p.name} : <span className="font-semibold tabular text-ink">{formatNumber(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { articles, demandes, mouvements, findUser } = useAppData()

  const stockTotal = articles.reduce((sum, a) => sum + a.stock, 0)
  const actifs = articles.filter((a) => a.statut === 'disponible')
  const articlesCritiques = actifs.filter((a) => stockLevel(a.stock, a.seuil) === 'critique')
  const alertes = actifs
    .filter((a) => stockLevel(a.stock, a.seuil) !== 'normal')
    .sort((a, b) => a.stock / Math.max(a.seuil, 1) - b.stock / Math.max(b.seuil, 1))
  const enAttente = demandes.filter((d) => d.statut === 'en_attente').sort((a, b) => (a.date < b.date ? 1 : -1))
  const approuvees = demandes.filter((d) => d.statut === 'approuvee')
  const rejetees = demandes.filter((d) => d.statut === 'rejetee')

  const now = new Date()
  const sortiesCeMois = mouvements
    .filter((m) => {
      const d = new Date(m.date)
      return m.type === 'sortie' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, m) => sum + m.quantite, 0)

  const stats = [
    { label: 'Unités en stock', value: stockTotal, href: '/gestion/articles', icon: Boxes, tone: 'ink' },
    { label: 'Articles en seuil critique', value: articlesCritiques.length, href: '/gestion/alertes', icon: TriangleAlert, tone: 'danger' },
    { label: 'Demandes en attente', value: enAttente.length, href: '/gestion/demandes?statut=en_attente', icon: Clock3, tone: 'warn' },
    { label: 'Demandes approuvées', value: approuvees.length, href: '/gestion/demandes?statut=approuvee', icon: CircleCheck, tone: 'ok' },
    { label: 'Demandes rejetées', value: rejetees.length, href: '/gestion/demandes?statut=rejetee', icon: XCircle, tone: 'danger' },
    { label: 'Unités sorties ce mois-ci', value: sortiesCeMois, href: '/gestion/historique?onglet=sorties&periode=mois', icon: ArrowUpFromLine, tone: 'gold' },
  ]

  const chartData = useMemo(() => {
    const byMonth = {}
    mouvements.forEach((m) => {
      const d = new Date(m.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!byMonth[key]) byMonth[key] = { key, label: monthLabels[d.getMonth()], entrees: 0, sorties: 0, order: d.getFullYear() * 12 + d.getMonth() }
      byMonth[key][m.type === 'entree' ? 'entrees' : 'sorties'] += m.quantite
    })
    return Object.values(byMonth).sort((a, b) => a.order - b.order)
  }, [mouvements])

  return (
    <div>
      {/* ---------- Bandeau ---------- */}
      <section className="animate-fade-up relative mb-6 overflow-hidden rounded-3xl bg-ink px-6 py-7 text-white shadow-lift sm:px-8 sm:py-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="animate-float absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gold/35 blur-3xl" />
          <div className="animate-float absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-[#4f62b4]/35 blur-3xl [animation-delay:-3s]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
        </div>
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-soft">
              <Sparkles size={14} aria-hidden="true" /> Tableau de bord
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              {enAttente.length > 0 ? (
                <>
                  <span className="text-gradient-gold">{enAttente.length}</span> demande{enAttente.length > 1 ? 's' : ''} attend{enAttente.length > 1 ? 'ent' : ''} votre décision
                </>
              ) : (
                <>Tout est à jour ✨</>
              )}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/65">
              {alertes.length > 0
                ? `${alertes.length} article${alertes.length > 1 ? 's sont' : ' est'} sous le seuil minimum. Pensez au réapprovisionnement.`
                : 'Tous les articles sont à un niveau de stock normal.'}
            </p>
          </div>
          {enAttente.length > 0 ? (
            <Link
              to="/gestion/demandes"
              className="group inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-gold-soft to-gold px-5 text-sm font-bold text-ink-2 shadow-[0_10px_30px_-8px_rgb(242_199_110/0.6)] transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              Traiter les demandes
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </section>

      {/* ---------- Indicateurs ---------- */}
      <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ---------- Graphique ---------- */}
        <section className="animate-fade-up rounded-2xl border border-line bg-surface p-5 shadow-soft lg:col-span-3 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Mouvements de stock</h2>
              <p className="text-xs text-muted">Entrées et sorties par mois</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ok" aria-hidden="true" /> Entrées</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gold" aria-hidden="true" /> Sorties</span>
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-center">
              <Inbox size={22} className="text-muted" aria-hidden="true" />
              <p className="text-sm text-muted">Aucun mouvement enregistré pour le moment.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240} minHeight={240}>
              <AreaChart data={chartData} margin={{ left: -18, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="g-entrees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16794a" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#16794a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g-sorties" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b07716" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#b07716" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e6ef" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#616b84' }} axisLine={false} tickLine={false} dy={6} />
                <YAxis tick={{ fontSize: 11, fill: '#616b84' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#141c33', strokeOpacity: 0.12, strokeWidth: 1 }} />
                <Area type="monotone" dataKey="entrees" name="Entrées" stroke="#16794a" strokeWidth={2.5} fill="url(#g-entrees)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} animationDuration={1100} />
                <Area type="monotone" dataKey="sorties" name="Sorties" stroke="#b07716" strokeWidth={2.5} fill="url(#g-sorties)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} animationDuration={1100} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* ---------- Demandes en attente ---------- */}
        <section className="animate-fade-up rounded-2xl border border-line bg-surface p-5 shadow-soft lg:col-span-2 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Demandes en attente</h2>
            <Link to="/gestion/demandes" className="flex items-center gap-0.5 text-xs font-semibold text-gold hover:text-gold-2">
              Tout voir <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {enAttente.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CircleCheckBig size={26} className="text-ok" aria-hidden="true" />
              <p className="text-sm text-muted">Aucune demande en attente.</p>
            </div>
          ) : (
            <ul className="stagger space-y-2">
              {enAttente.slice(0, 5).map((d) => {
                const demandeur = findUser(d.demandeurId)
                return (
                  <li key={d.id}>
                    <Link
                      to={`/gestion/demandes/${d.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 transition-all duration-200 hover:border-gold/40 hover:bg-gold-bg/40"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warn-bg text-warn">
                        <Clock3 size={16} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{demandeur?.nom || d.numero}</span>
                        <span className="block truncate text-xs text-muted">
                          <span className="font-mono">{d.numero}</span> · {formatDate(d.date)} · {d.lignes.length} article{d.lignes.length > 1 ? 's' : ''}
                        </span>
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {/* ---------- Alertes ---------- */}
      <section className="animate-fade-up mt-6 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Articles en alerte de seuil</h2>
          <Link to="/gestion/alertes" className="flex items-center gap-0.5 text-xs font-semibold text-gold hover:text-gold-2">
            Voir toutes les alertes <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>
        {alertes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CircleCheckBig size={26} className="text-ok" aria-hidden="true" />
            <p className="text-sm text-muted">Tous les articles sont à un niveau normal.</p>
          </div>
        ) : (
          <ul className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alertes.slice(0, 6).map((a) => {
              const level = stockLevel(a.stock, a.seuil)
              return (
                <li key={a.id}>
                  <Link
                    to={`/gestion/articles/${a.id}`}
                    className="block rounded-xl border border-line p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-semibold text-ink">{a.designation}</p>
                      <StatusPill config={stockLevelConfig[level]} size="sm" />
                    </div>
                    <p className="mt-1 text-xs tabular text-muted">
                      <span className="font-semibold text-ink">{a.stock}</span> / seuil {a.seuil} {uniteLabel(a.seuil, a.unite)}
                    </p>
                    <StockGauge stock={a.stock} seuil={a.seuil} className="mt-2.5" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
