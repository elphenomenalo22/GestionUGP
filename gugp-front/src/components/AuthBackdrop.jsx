/** Fond animé sombre partagé par les écrans d'authentification. */
export default function AuthBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden bg-ink-2">
      <div className="animate-float absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-gold/30 blur-[120px]" />
      <div className="animate-float absolute -bottom-48 right-[-10rem] h-[38rem] w-[38rem] rounded-full bg-[#4f62b4]/35 blur-[130px] [animation-delay:-3.5s]" />
      <div className="animate-float absolute left-1/2 top-1/3 h-72 w-72 rounded-full bg-gold-soft/10 blur-[100px] [animation-delay:-1.5s]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
    </div>
  )
}
