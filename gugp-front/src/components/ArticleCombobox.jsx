import { useId, useMemo, useRef, useState } from 'react'
import { Search, X, PackageSearch } from 'lucide-react'
import { uniteLabel } from '../utils/format'
import { stockLevel, stockLevelConfig } from '../utils/status'
import StockGauge from './StockGauge'

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/**
 * Champ de recherche d'article avec liste déroulante (motif ARIA combobox).
 * Flèches haut/bas pour naviguer, Entrée pour choisir, Échap pour fermer.
 */
export default function ArticleCombobox({ articles, value, onChange, label = 'Article', autoFocus = false }) {
  const id = useId()
  const listId = `${id}-list`
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const selected = articles.find((a) => a.id === value) || null

  const results = useMemo(() => {
    const q = normalize(query.trim())
    const list = q
      ? articles.filter((a) => normalize(a.designation).includes(q) || normalize(a.reference).includes(q) || normalize(a.categorie).includes(q))
      : articles
    return list.slice(0, 50)
  }, [articles, query])

  function choose(article) {
    onChange(article.id)
    setQuery('')
    setOpen(false)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      if (open && results[active]) {
        e.preventDefault()
        choose(results[active])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  if (selected) {
    const level = stockLevel(selected.stock, selected.seuil)
    const cfg = stockLevelConfig[level]
    return (
      <div>
        <p className="mb-1.5 block text-xs font-medium text-muted">{label}</p>
        <div className="animate-scale-in flex items-center gap-3 rounded-xl border border-gold/40 bg-gold-bg/60 px-3.5 py-3 ring-4 ring-gold/10">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink" title={selected.designation}>{selected.designation}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
              <span className="font-mono">{selected.reference}</span>
              <span aria-hidden="true">·</span>
              <span className={`font-medium ${cfg.color}`}>
                {selected.stock} {uniteLabel(selected.stock, selected.unite)} en stock
              </span>
            </p>
            <StockGauge stock={selected.stock} seuil={selected.seuil} className="mt-2" />
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('')
              setOpen(true)
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-white hover:text-ink"
            aria-label={`Changer d'article (actuellement ${selected.designation})`}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">{label}</label>
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${id}-opt-${results[active].id}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          value={query}
          placeholder="Rechercher un article…"
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className="h-11 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted"
        />
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Articles"
          className="scroll-thin animate-scale-in absolute inset-x-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-lift"
        >
          {results.length === 0 ? (
            <li className="flex items-center gap-2 px-3 py-4 text-sm text-muted">
              <PackageSearch size={16} aria-hidden="true" /> Aucun article ne correspond à « {query} ».
            </li>
          ) : (
            results.map((a, i) => {
              const level = stockLevel(a.stock, a.seuil)
              const cfg = stockLevelConfig[level]
              return (
                <li
                  key={a.id}
                  id={`${id}-opt-${a.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(a)
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    i === active ? 'bg-paper-2' : ''
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{a.designation}</span>
                    <span className="block truncate text-xs text-muted">
                      <span className="font-mono">{a.reference}</span> · {a.categorie}
                    </span>
                  </span>
                  <span className={`shrink-0 text-xs font-semibold tabular ${cfg.color}`}>
                    {a.stock} <span className="font-normal text-muted">{uniteLabel(a.stock, a.unite)}</span>
                  </span>
                </li>
              )
            })
          )}
        </ul>
      ) : null}
    </div>
  )
}
