import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Sélecteur segmenté avec indicateur glissant.
 * items : [{ key, label, count? }]
 */
export default function Tabs({ items, value, onChange, label = 'Filtrer', className = '' }) {
  const containerRef = useRef(null)
  const [indicator, setIndicator] = useState(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const update = () => {
      const active = container.querySelector('[aria-pressed="true"]')
      if (!active) return
      const next = { left: active.offsetLeft, width: active.offsetWidth }
      setIndicator((prev) => (prev && prev.left === next.left && prev.width === next.width ? prev : next))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(container)
    return () => ro.disconnect()
  }, [value, items])

  return (
    <div className={`no-scrollbar -mx-1 overflow-x-auto px-1 ${className}`}>
      <div
        ref={containerRef}
        role="group"
        aria-label={label}
        className="relative inline-flex items-center gap-1 rounded-xl border border-line bg-surface/80 p-1 shadow-soft"
      >
        {indicator ? (
          <span
            aria-hidden="true"
            className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-b from-ink-3 to-ink shadow-[0_4px_12px_-4px_rgb(20_28_51/0.5)] transition-[left,width] duration-300 ease-[var(--ease-out-soft)]"
            style={{ left: indicator.left, width: indicator.width }}
          />
        ) : null}
        {items.map((item) => {
          const active = item.key === value
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(item.key)}
              className={`relative z-10 inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-colors duration-200 ${
                active ? 'text-white' : 'text-muted hover:text-ink'
              }`}
            >
              {item.label}
              {item.count !== undefined ? (
                <span
                  className={`rounded-full px-1.5 text-[0.7rem] font-semibold tabular transition-colors ${
                    active ? 'bg-white/15 text-white' : 'bg-paper-2 text-muted'
                  }`}
                >
                  {item.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
