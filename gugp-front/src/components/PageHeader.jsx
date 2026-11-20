export default function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="animate-fade-up mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold">{eyebrow}</p>
        ) : null}
        {title ? <h1 className="text-2xl font-bold text-ink sm:text-[1.7rem]">{title}</h1> : null}
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
