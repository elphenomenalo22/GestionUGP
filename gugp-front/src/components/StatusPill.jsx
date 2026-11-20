export default function StatusPill({ config, size = 'md' }) {
  const Icon = config.icon
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[0.72rem]' : 'px-2.5 py-1 text-[0.8rem]'
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset ring-current/15 ${config.bg} ${config.color} ${padding}`}
    >
      {Icon ? (
        <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2.5} aria-hidden="true" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      )}
      {config.label}
    </span>
  )
}
