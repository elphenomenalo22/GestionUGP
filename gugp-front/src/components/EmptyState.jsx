export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="animate-fade-up flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-surface/50 px-6 py-16 text-center">
      {Icon ? (
        <div className="relative mb-1">
          <div className="absolute inset-0 scale-150 rounded-full bg-gold-soft/30 blur-xl" aria-hidden="true" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface text-gold shadow-soft">
            <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
          </div>
        </div>
      ) : null}
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {description ? <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
