export default function Logo({ size = 34, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a3760" />
          <stop offset="1" stopColor="#0b1122" />
        </linearGradient>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d48a" />
          <stop offset="1" stopColor="#c98a1e" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-bg)" />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.5" />
      <path d="M18 20h16l12 12-16 16-12-12V20z" fill="none" stroke="#F3F1EB" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="24" cy="26" r="3" fill="url(#logo-gold)" />
    </svg>
  )
}
