import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

/**
 * Compteur − / quantité / +.
 * Le champ central reste éditable au clavier ; la valeur est bornée à [min, max]
 * quand le champ perd le focus.
 */
export default function QuantityStepper({ value, onChange, min = 1, max, label, size = 'md', onDecrementBelowMin }) {
  const [draft, setDraft] = useState(String(value))
  const [syncedValue, setSyncedValue] = useState(value)

  // Si la valeur change de l'extérieur, on réaligne le brouillon (pendant le rendu, sans effet).
  if (syncedValue !== value) {
    setSyncedValue(value)
    setDraft(String(value))
  }

  function clamp(n) {
    let v = Number.isFinite(n) ? Math.round(n) : min
    if (v < min) v = min
    if (max !== undefined && max !== null && v > max) v = max
    return v
  }

  function commit(n) {
    const v = clamp(n)
    setDraft(String(v))
    if (v !== value) {
      onChange(v)
    }
  }

  const h = size === 'sm' ? 'h-8' : 'h-10'
  const btn = size === 'sm' ? 'w-8' : 'w-10'
  const atMax = max !== undefined && max !== null && value >= max

  return (
    <div className={`inline-flex ${h} items-stretch overflow-hidden rounded-lg border border-line bg-surface shadow-[0_1px_2px_rgb(20_28_51/0.05)]`}>
      <button
        type="button"
        onClick={() => (value <= min && onDecrementBelowMin ? onDecrementBelowMin() : commit(value - 1))}
        disabled={value <= min && !onDecrementBelowMin}
        aria-label={`Diminuer la quantité${label ? ` de ${label}` : ''}`}
        className={`${btn} flex items-center justify-center text-muted transition-colors hover:bg-paper-2 hover:text-ink active:bg-paper-2 disabled:opacity-35`}
      >
        <Minus size={size === 'sm' ? 13 : 15} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft}
        aria-label={`Quantité${label ? ` de ${label}` : ''}`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(Number(draft))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit(Number(draft))
          }
        }}
        className={`border-x border-line bg-transparent text-center text-sm font-semibold tabular text-ink !shadow-none focus:bg-gold-bg ${size === 'sm' ? 'w-10' : 'w-12'}`}
      />
      <button
        type="button"
        onClick={() => commit(value + 1)}
        disabled={atMax}
        aria-label={`Augmenter la quantité${label ? ` de ${label}` : ''}`}
        className={`${btn} flex items-center justify-center text-muted transition-colors hover:bg-paper-2 hover:text-ink active:bg-paper-2 disabled:opacity-35`}
      >
        <Plus size={size === 'sm' ? 13 : 15} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  )
}
