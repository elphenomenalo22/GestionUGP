const variants = {
  primary:
    'bg-gradient-to-b from-ink-3 to-ink text-white border border-ink shadow-[0_6px_16px_-6px_rgb(20_28_51/0.5)] hover:shadow-[0_10px_24px_-8px_rgb(20_28_51/0.55)] hover:-translate-y-px',
  gold:
    'bg-gradient-to-b from-gold to-gold-2 text-white border border-gold-2 shadow-glow hover:shadow-[0_12px_28px_-8px_rgb(176_119_22/0.6)] hover:-translate-y-px',
  secondary: 'bg-surface text-ink border border-line shadow-[0_1px_2px_rgb(20_28_51/0.05)] hover:border-ink/25 hover:bg-paper/60',
  ghost: 'bg-transparent text-ink hover:bg-paper-2 border border-transparent',
  danger: 'bg-surface text-danger border border-danger/30 hover:bg-danger-bg hover:border-danger/50',
}

const sizes = {
  sm: 'h-8 px-3 text-[0.8rem] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-[0.95rem] gap-2',
}

const base =
  'relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-md font-semibold transition-[transform,box-shadow,background-color,border-color,color] duration-200 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'

/** Classes d'un bouton, à appliquer à un <Link> pour lui donner l'apparence d'un bouton. */
export function buttonClasses(variant = 'secondary', size = 'md', className = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`
}
