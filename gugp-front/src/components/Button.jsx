import { LoaderCircle } from 'lucide-react'
import { buttonClasses } from './buttonStyles'


export default function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle size={size === 'sm' ? 14 : 16} className="animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.25} aria-hidden="true" />
      ) : null}
      {children}
    </button>
  )
}
