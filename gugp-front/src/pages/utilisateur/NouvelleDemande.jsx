import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  Send,
  PackageX,
  PackageSearch,
  ShoppingBag,
  Check,
  Plus,
  Trash2,
  X,
  ChevronUp,
  TriangleAlert,
  FolderKanban,
  MousePointerClick,
} from 'lucide-react'
import { uniteLabel } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { stockLevel, stockLevelConfig } from '../../utils/status'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import QuantityStepper from '../../components/QuantityStepper'
import StockGauge from '../../components/StockGauge'
import EmptyState from '../../components/EmptyState'

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function plural(n, word) {
  return `${n} ${word}${n > 1 ? 's' : ''}`
}

/* ------------------------------------------------------------------ */
/* Carte article                                                       */
/* ------------------------------------------------------------------ */

function ArticleCard({ article, quantite, onAdd, onChange, onRemove }) {
  const inCart = quantite > 0
  const rupture = article.stock <= 0
  const level = stockLevel(article.stock, article.seuil)
  const cfg = stockLevelConfig[level]

  return (
    <li
      className={`group relative flex flex-col rounded-2xl border bg-surface p-4 transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-soft)] ${
        rupture
          ? 'border-line opacity-60'
          : inCart
            ? 'border-gold/60 shadow-[0_0_0_4px_rgb(176_119_22/0.12),0_12px_28px_-14px_rgb(176_119_22/0.5)]'
            : 'border-line shadow-soft hover:-translate-y-1 hover:border-ink/15 hover:shadow-lift'
      }`}
    >
      {/* Le bouton principal couvre toute la carte (::after) : un clic n'importe où ajoute 1. */}
      <button
        type="button"
        disabled={rupture || (inCart && quantite >= article.stock)}
        onClick={onAdd}
        aria-label={
          rupture
            ? `${article.designation} : rupture de stock`
            : inCart
              ? `Ajouter une unité de ${article.designation} (${quantite} dans la demande)`
              : `Ajouter ${article.designation} à la demande`
        }
        className="text-left outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-gold disabled:cursor-not-allowed"
      >
        <span className="flex items-start justify-between gap-2">
          <span className="truncate rounded-full bg-paper-2 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-muted">
            {article.categorie}
          </span>
          {inCart ? (
            <span
              key={quantite}
              className="animate-pop flex h-6 min-w-6 items-center justify-center gap-0.5 rounded-full bg-gradient-to-b from-gold to-gold-2 px-1.5 text-xs font-bold text-white shadow-glow"
              aria-hidden="true"
            >
              <Check size={12} strokeWidth={3} /> {quantite}
            </span>
          ) : (
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} aria-hidden="true" />
          )}
        </span>
        <span className="mt-3 line-clamp-2 block min-h-[2.5rem] text-[0.95rem] font-semibold leading-snug text-ink">
          {article.designation}
        </span>
        <span className="mt-1 block font-mono text-[0.7rem] text-muted">{article.reference}</span>
      </button>

      <StockGauge stock={article.stock} seuil={article.seuil} className="mt-3.5" />

      <div className="mt-3 flex min-h-10 items-center justify-between gap-2">
        <p className="min-w-0 text-xs text-muted">
          {rupture ? (
            <span className="font-semibold text-danger">Rupture de stock</span>
          ) : (
            <>
              <span className={`font-bold tabular ${cfg.color}`}>{article.stock}</span> {uniteLabel(article.stock, article.unite)} dispo.
            </>
          )}
        </p>

        {inCart ? (
          <div className="relative z-10 animate-scale-in">
            <QuantityStepper
              size="sm"
              value={quantite}
              max={article.stock}
              label={article.designation}
              onChange={onChange}
              onDecrementBelowMin={onRemove}
            />
          </div>
        ) : !rupture ? (
          <span
            aria-hidden="true"
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-ink px-3 text-xs font-semibold text-white shadow-[0_4px_12px_-4px_rgb(20_28_51/0.5)] transition-[transform,background-color] duration-200 group-hover:scale-105 group-hover:bg-gold"
          >
            <Plus size={14} strokeWidth={2.75} /> Ajouter
          </span>
        ) : null}
      </div>
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* Panier de la demande                                                */
/* ------------------------------------------------------------------ */

function CartPanel({ lignes, findArticle, onChange, onRemove, onClear, motif, setMotif, onSubmit, submitting, error, onClose }) {
  const totalUnites = lignes.reduce((s, l) => s + l.quantite, 0)

  return (
    <div className="flex max-h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ink-3 to-ink text-gold-soft">
            <ShoppingBag size={18} aria-hidden="true" />
            {lignes.length > 0 ? (
              <span
                key={lignes.length}
                className="animate-pop absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.68rem] font-bold text-white ring-2 ring-surface"
              >
                {lignes.length}
              </span>
            ) : null}
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Ma demande</h2>
            <p className="text-xs text-muted">
              {lignes.length === 0 ? 'Aucun article' : `${plural(lignes.length, 'article')} · ${plural(totalUnites, 'unité')}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {lignes.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-danger-bg hover:text-danger"
            >
              Tout retirer
            </button>
          ) : null}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-paper-2 hover:text-ink"
              aria-label="Fermer ma demande"
            >
              <X size={18} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {lignes.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <div className="relative mb-3">
              <div className="absolute inset-0 scale-150 rounded-full bg-gold-soft/30 blur-xl" aria-hidden="true" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-gold-bg text-gold">
                <MousePointerClick size={22} aria-hidden="true" />
              </div>
            </div>
            <p className="text-sm font-semibold text-ink">Votre demande est vide</p>
            <p className="mt-1 max-w-[16rem] text-xs text-muted">
              Touchez une carte article pour l'ajouter. Chaque nouveau clic ajoute une unité.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {lignes.map((ligne) => {
              const article = findArticle(ligne.articleId)
              if (!article) return null
              const depasse = ligne.quantite > article.stock
              return (
                <li
                  key={ligne.articleId}
                  className={`animate-scale-in rounded-xl border px-3 py-2.5 ${depasse ? 'border-danger/40 bg-danger-bg/50' : 'border-line bg-paper/50'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-ink">{article.designation}</p>
                      <p className="mt-0.5 text-[0.7rem] text-muted">
                        {article.stock} {uniteLabel(article.stock, article.unite)} disponibles
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(ligne.articleId)}
                      className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-bg hover:text-danger"
                      aria-label={`Retirer ${article.designation}`}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantityStepper
                      size="sm"
                      value={ligne.quantite}
                      max={article.stock}
                      label={article.designation}
                      onChange={(v) => onChange(ligne.articleId, v)}
                      onDecrementBelowMin={() => onRemove(ligne.articleId)}
                    />
                    <span className="text-xs text-muted">{uniteLabel(ligne.quantite, article.unite)}</span>
                  </div>
                  {depasse ? (
                    <p className="mt-1.5 flex items-center gap-1 text-[0.7rem] font-medium text-danger">
                      <TriangleAlert size={12} aria-hidden="true" /> Quantité supérieure au stock
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t border-line px-5 py-4">
        <div>
          <label htmlFor="motif-demande" className="mb-1.5 block text-xs font-medium text-muted">
            Motif ou justification <span className="font-normal">(facultatif)</span>
          </label>
          <textarea
            id="motif-demande"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            rows={2}
            placeholder="Ex. fournitures pour l'atelier de la semaine prochaine"
            className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted"
          />
        </div>
        {error ? (
          <p role="alert" className="flex items-start gap-1.5 rounded-lg bg-danger-bg px-3 py-2 text-xs font-medium text-danger">
            <TriangleAlert size={14} className="mt-px shrink-0" aria-hidden="true" /> {error}
          </p>
        ) : null}
        <Button
          variant="gold"
          size="lg"
          icon={Send}
          loading={submitting}
          disabled={lignes.length === 0}
          onClick={onSubmit}
          className="w-full"
        >
          {submitting ? 'Envoi en cours…' : 'Soumettre la demande'}
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function NouvelleDemande() {
  const { currentUser } = useAuth()
  const { articles, programmes, addDemande, findArticle } = useAppData()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchRef = useRef(null)
  const preselectDone = useRef(false)

  const [choixProgramme, setProgrammeId] = useState('')
  // Par défaut : le premier programme (les programmes se chargent après l'authentification).
  const programmeId = choixProgramme || programmes[0]?.id || ''
  const [query, setQuery] = useState('')
  const [categorie, setCategorie] = useState('all')
  const [lignes, setLignes] = useState([])
  const [motif, setMotif] = useState('')
  const [stockIssues, setStockIssues] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [pendingProgramme, setPendingProgramme] = useState(null)
  const [announce, setAnnounce] = useState('')

  // Article présélectionné depuis le catalogue (?article=…), appliqué une fois les articles chargés.
  useEffect(() => {
    if (preselectDone.current) return
    const preselect = searchParams.get('article')
    if (!preselect) {
      preselectDone.current = true
      return
    }
    const article = findArticle(preselect)
    if (!article) return
    preselectDone.current = true
    setProgrammeId(article.programmeId)
    if (article.stock > 0) {
      setLignes((prev) => (prev.some((l) => l.articleId === preselect) ? prev : [...prev, { articleId: preselect, quantite: 1 }]))
    }
  }, [articles, findArticle, searchParams])

  // Raccourci « / » pour aller à la recherche.
  useEffect(() => {
    function onKey(e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey) return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const disponibles = useMemo(
    () => articles.filter((a) => a.statut === 'disponible' && a.programmeId === programmeId),
    [articles, programmeId]
  )

  const categories = useMemo(() => {
    const counts = new Map()
    disponibles.forEach((a) => counts.set(a.categorie, (counts.get(a.categorie) || 0) + 1))
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr'))
  }, [disponibles])

  const visibles = useMemo(() => {
    const q = normalize(query.trim())
    return disponibles
      .filter((a) => categorie === 'all' || a.categorie === categorie)
      .filter((a) => !q || normalize(a.designation).includes(q) || normalize(a.reference).includes(q))
      .sort((a, b) => {
        const ruptureA = a.stock <= 0 ? 1 : 0
        const ruptureB = b.stock <= 0 ? 1 : 0
        if (ruptureA !== ruptureB) return ruptureA - ruptureB
        return a.designation.localeCompare(b.designation, 'fr')
      })
  }, [disponibles, query, categorie])

  const qtyById = useMemo(() => new Map(lignes.map((l) => [l.articleId, l.quantite])), [lignes])
  const totalUnites = lignes.reduce((s, l) => s + l.quantite, 0)

  function addOne(article) {
    if (article.stock <= 0) return
    setSubmitError('')
    setLignes((prev) => {
      const existing = prev.find((l) => l.articleId === article.id)
      if (existing) {
        return prev.map((l) => (l.articleId === article.id ? { ...l, quantite: Math.min(article.stock, l.quantite + 1) } : l))
      }
      return [...prev, { articleId: article.id, quantite: 1 }]
    })
    const current = qtyById.get(article.id) || 0
    setAnnounce(`${article.designation} : ${Math.min(article.stock, current + 1)} dans la demande`)
  }

  function setQuantite(id, quantite) {
    setLignes((prev) => prev.map((l) => (l.articleId === id ? { ...l, quantite } : l)))
  }

  function removeLigne(id) {
    const article = findArticle(id)
    setLignes((prev) => prev.filter((l) => l.articleId !== id))
    if (article) setAnnounce(`${article.designation} retiré de la demande`)
  }

  function requestProgrammeChange(id) {
    if (id === programmeId) return
    if (lignes.length > 0) setPendingProgramme(id)
    else applyProgrammeChange(id)
  }

  function applyProgrammeChange(id) {
    setProgrammeId(id)
    setLignes([])
    setCategorie('all')
    setPendingProgramme(null)
  }

  function onSearchKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const first = visibles.find((a) => a.stock > 0)
      if (first) addOne(first)
    } else if (e.key === 'Escape') {
      setQuery('')
    }
  }

  async function handleSubmit() {
    if (lignes.length === 0 || submitting) return
    setSubmitError('')

    const issues = lignes
      .map((l) => ({ ligne: l, article: findArticle(l.articleId) }))
      .filter(({ ligne, article }) => article && ligne.quantite > article.stock)
    if (issues.length > 0) {
      setStockIssues(issues)
      return
    }

    setSubmitting(true)
    try {
      const demande = await addDemande({ demandeurId: currentUser.id, lignes, motif })
      navigate(`/app/mes-demandes/${demande.id}`)
    } catch (err) {
      setSubmitError(err.message || "La demande n'a pas pu être envoyée. Réessayez.")
      setSubmitting(false)
    }
  }

  const cartProps = {
    lignes,
    findArticle,
    onChange: setQuantite,
    onRemove: removeLigne,
    onClear: () => setLignes([]),
    motif,
    setMotif,
    onSubmit: handleSubmit,
    submitting,
    error: submitError,
  }

  if (programmes.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Expression de besoin" title="Nouvelle demande" />
        <EmptyState
          icon={FolderKanban}
          title="Aucun programme rattaché"
          description="Vous n'êtes rattaché à aucun programme. Contactez un administrateur pour pouvoir soumettre une expression de besoin."
        />
      </div>
    )
  }

  return (
    <div className="pb-24 lg:pb-0">
      <p className="sr-only" aria-live="polite">{announce}</p>

      <PageHeader
        eyebrow="Expression de besoin"
        title="Composez votre demande"
        description="Touchez un article pour l'ajouter, ajustez les quantités, puis soumettez. Astuce : tapez « / » pour rechercher et Entrée pour ajouter le premier résultat."
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        {/* ---------- Colonne articles ---------- */}
        <section aria-label="Choix des articles" className="min-w-0">
          {programmes.length > 1 ? (
            <div className="animate-fade-up mb-4">
              <p className="mb-2 text-xs font-medium text-muted">Programme</p>
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Programme">
                {programmes.map((p) => {
                  const active = p.id === programmeId
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => requestProgrammeChange(p.id)}
                      className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'border-ink bg-gradient-to-b from-ink-3 to-ink text-white shadow-[0_6px_16px_-6px_rgb(20_28_51/0.5)]'
                          : 'border-line bg-surface text-muted hover:border-ink/25 hover:text-ink'
                      }`}
                    >
                      <FolderKanban size={15} className={active ? 'text-gold-soft' : ''} aria-hidden="true" />
                      {p.nom}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* Recherche */}
          <div className="animate-fade-up sticky top-16 z-20 -mx-1 mb-4 px-1 pt-1">
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
                aria-label="Rechercher un article"
                placeholder="Rechercher un article par nom ou référence…"
                className="h-12 w-full rounded-2xl border border-line bg-surface/95 pl-11 pr-12 text-[0.95rem] text-ink shadow-soft backdrop-blur placeholder:text-muted"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    searchRef.current?.focus()
                  }}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-paper-2 text-muted hover:text-ink"
                  aria-label="Effacer la recherche"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-paper px-1.5 py-0.5 font-mono text-[0.7rem] text-muted sm:block">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Catégories */}
          {categories.length > 1 ? (
            <div className="no-scrollbar animate-fade-up -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Catégories">
              {[['all', disponibles.length], ...categories].map(([cat, count]) => {
                const active = categorie === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategorie(cat)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-all duration-200 ${
                      active
                        ? 'border-gold/50 bg-gold-bg text-gold-2 shadow-[0_0_0_3px_rgb(176_119_22/0.1)]'
                        : 'border-line bg-surface text-muted hover:border-ink/20 hover:text-ink'
                    }`}
                  >
                    {cat === 'all' ? 'Tout' : cat}
                    <span className={`tabular text-[0.7rem] ${active ? 'text-gold' : 'text-muted/70'}`}>{count}</span>
                  </button>
                )
              })}
            </div>
          ) : null}

          {/* Grille */}
          {disponibles.length === 0 ? (
            <EmptyState
              icon={PackageX}
              title="Aucun article disponible"
              description="Ce programme ne contient encore aucun article disponible. Rapprochez-vous de votre gestionnaire."
            />
          ) : visibles.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title={query ? `Aucun résultat pour « ${query} »` : 'Aucun article dans cette catégorie'}
              description="Essayez un autre mot-clé ou affichez toutes les catégories."
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setQuery('')
                    setCategorie('all')
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              }
            />
          ) : (
            <ul className="stagger grid grid-cols-1 gap-3.5 sm:grid-cols-2 2xl:grid-cols-3" aria-label="Articles disponibles">
              {visibles.map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  quantite={qtyById.get(a.id) || 0}
                  onAdd={() => addOne(a)}
                  onChange={(v) => setQuantite(a.id, v)}
                  onRemove={() => removeLigne(a.id)}
                />
              ))}
            </ul>
          )}
        </section>

        {/* ---------- Panier (bureau) ---------- */}
        <aside
          aria-label="Ma demande"
          className="animate-fade-up sticky top-20 hidden max-h-[calc(100dvh-6.5rem)] overflow-hidden rounded-2xl border border-line bg-surface shadow-lift lg:flex lg:flex-col"
        >
          <CartPanel {...cartProps} />
        </aside>
      </div>

      {/* ---------- Barre panier (mobile) ---------- */}
      {lignes.length > 0 && !cartOpen ? (
        <div className="animate-fade-up fixed inset-x-3 bottom-3 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-gradient-to-b from-ink-3 to-ink px-4 py-3 text-left text-white shadow-[0_18px_40px_-12px_rgb(11_17_34/0.7)] transition-transform active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-gold-soft">
                <ShoppingBag size={18} aria-hidden="true" />
                <span
                  key={totalUnites}
                  className="animate-pop absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.68rem] font-bold text-white"
                >
                  {lignes.length}
                </span>
              </span>
              <span>
                <span className="block text-sm font-semibold">Voir ma demande</span>
                <span className="block text-xs text-white/60">
                  {plural(lignes.length, 'article')} · {plural(totalUnites, 'unité')}
                </span>
              </span>
            </span>
            <ChevronUp size={20} className="text-gold-soft" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {/* ---------- Tiroir panier (mobile) ---------- */}
      {cartOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Ma demande">
          <div className="animate-fade-in absolute inset-0 bg-ink-2/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} aria-hidden="true" />
          <div className="animate-slide-up absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl bg-surface shadow-lift">
            <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-paper-2" aria-hidden="true" />
            <CartPanel {...cartProps} onClose={() => setCartOpen(false)} />
          </div>
        </div>
      ) : null}

      {/* ---------- Changement de programme ---------- */}
      <Modal open={!!pendingProgramme} onClose={() => setPendingProgramme(null)} title="Changer de programme ?">
        <p className="text-sm text-muted">
          Une demande ne peut porter que sur les articles d'un seul programme. Les{' '}
          <span className="font-semibold text-ink">{plural(lignes.length, 'article')}</span> déjà choisis seront retirés.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPendingProgramme(null)}>Annuler</Button>
          <Button variant="primary" onClick={() => applyProgrammeChange(pendingProgramme)}>Changer de programme</Button>
        </div>
      </Modal>

      {/* ---------- Stock insuffisant ---------- */}
      <Modal open={!!stockIssues} onClose={() => setStockIssues(null)} title="Stock insuffisant">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-bg text-danger">
            <PackageX size={20} aria-hidden="true" />
          </div>
          <p className="text-sm text-muted">
            La quantité demandée dépasse le stock disponible pour {stockIssues?.length > 1 ? 'ces articles' : 'cet article'}.
            Retirez-{stockIssues?.length > 1 ? 'les' : 'le'} ou diminuez la quantité avant de soumettre.
          </p>
        </div>
        <ul className="mt-4 space-y-2">
          {stockIssues?.map(({ ligne, article }) => (
            <li key={ligne.articleId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-danger/30 bg-danger-bg px-3 py-2 text-sm">
              <span className="font-medium text-ink">{article.designation}</span>
              <span className="tabular text-danger">
                {ligne.quantite} demandé{ligne.quantite > 1 ? 's' : ''} / {article.stock} {uniteLabel(article.stock, article.unite)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-end">
          <Button variant="gold" onClick={() => setStockIssues(null)}>Compris</Button>
        </div>
      </Modal>
    </div>
  )
}
