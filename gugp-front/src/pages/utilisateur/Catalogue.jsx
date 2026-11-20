import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, PackagePlus, PackageSearch, X, ArrowRight } from 'lucide-react'
import { uniteLabel } from '../../utils/format'
import { useAppData } from '../../context/AppDataContext'
import { stockLevel, stockLevelConfig } from '../../utils/status'
import StatusPill from '../../components/StatusPill'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import StockGauge from '../../components/StockGauge'
import { buttonClasses } from '../../components/buttonStyles'

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export default function Catalogue() {
  const { articles, categories } = useAppData()
  const [query, setQuery] = useState('')
  const [categorie, setCategorie] = useState('all')

  const disponibles = useMemo(() => articles.filter((a) => a.statut === 'disponible'), [articles])

  const filtres = useMemo(() => {
    const q = normalize(query.trim())
    return disponibles.filter((a) => {
      const matchQuery = !q || normalize(a.designation).includes(q) || normalize(a.reference).includes(q)
      const matchCategorie = categorie === 'all' || a.categorie === categorie
      return matchQuery && matchCategorie
    })
  }, [disponibles, query, categorie])

  const presentes = categories.filter((c) => disponibles.some((a) => a.categorie === c))

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Articles disponibles"
        description="Consultez le niveau de stock de chaque article avant de composer votre expression de besoin."
        actions={
          <Link to="/app/nouvelle-demande" className={buttonClasses('gold')}>
            <PackagePlus size={16} strokeWidth={2.25} aria-hidden="true" /> Nouvelle demande
          </Link>
        }
      />

      <div className="animate-fade-up mb-4">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher un article"
            placeholder="Rechercher par référence ou désignation…"
            className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-11 text-[0.95rem] text-ink shadow-soft placeholder:text-muted"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-paper-2 text-muted hover:text-ink"
              aria-label="Effacer la recherche"
            >
              <X size={14} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {presentes.length > 1 ? (
        <div className="no-scrollbar animate-fade-up -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Catégories">
          {['all', ...presentes].map((c) => {
            const active = categorie === c
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => setCategorie(c)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-all duration-200 ${
                  active
                    ? 'border-gold/50 bg-gold-bg text-gold-2 shadow-[0_0_0_3px_rgb(176_119_22/0.1)]'
                    : 'border-line bg-surface text-muted hover:border-ink/20 hover:text-ink'
                }`}
              >
                {c === 'all' ? 'Toutes les catégories' : c}
              </button>
            )
          })}
        </div>
      ) : null}

      {filtres.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Aucun article ne correspond à cette recherche"
          description="Essayez un autre mot-clé ou choisissez une autre catégorie."
        />
      ) : (
        <ul className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtres.map((a) => {
            const level = stockLevel(a.stock, a.seuil)
            const cfg = stockLevelConfig[level]
            const rupture = a.stock <= 0
            return (
              <li
                key={a.id}
                className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-ink/15 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate rounded-full bg-paper-2 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-muted">
                    {a.categorie}
                  </span>
                  <span className="font-mono text-[0.7rem] text-muted">{a.reference}</span>
                </div>
                <h2 className="mt-3 line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-ink">{a.designation}</h2>
                <div className="mt-4 flex items-end justify-between gap-2">
                  <p className="text-xs text-muted">
                    <span className={`text-xl font-bold tabular ${cfg.color}`}>{a.stock}</span> {uniteLabel(a.stock, a.unite)}
                  </p>
                  <StatusPill config={cfg} size="sm" />
                </div>
                <StockGauge stock={a.stock} seuil={a.seuil} className="mt-2.5" />
                {rupture ? (
                  <p className="mt-4 rounded-xl bg-paper px-3 py-2 text-center text-xs font-medium text-muted">Indisponible pour le moment</p>
                ) : (
                  <Link
                    to={`/app/nouvelle-demande?article=${a.id}`}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-paper/60 px-3 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:border-ink hover:bg-ink hover:text-white"
                    aria-label={`Ajouter ${a.designation} à une demande`}
                  >
                    <PackagePlus size={15} aria-hidden="true" />
                    Ajouter à une demande
                    <ArrowRight size={14} className="-ml-1 w-0 opacity-0 transition-all duration-200 group-hover:ml-0 group-hover:w-3.5 group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
