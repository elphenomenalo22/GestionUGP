import { stockLevel } from '../utils/status'

const barColor = {
  critique: 'from-danger/80 to-danger',
  faible: 'from-warn/70 to-warn',
  normal: 'from-ok/70 to-ok',
}

/**
 * Petite jauge horizontale du stock par rapport au seuil.
 * La barre est pleine à 3× le seuil (ou dès qu'il y a du stock si aucun seuil).
 */
export default function StockGauge({ stock, seuil, className = '' }) {
  const level = stockLevel(stock, seuil)
  const ref = seuil > 0 ? seuil * 3 : Math.max(stock, 1)
  const pct = stock <= 0 ? 0 : Math.max(6, Math.min(100, (stock / ref) * 100))
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-paper-2 ${className}`} aria-hidden="true">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${barColor[level]} transition-[width] duration-700 ease-[var(--ease-out-soft)]`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
