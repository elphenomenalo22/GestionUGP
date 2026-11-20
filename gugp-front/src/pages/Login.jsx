import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Mail, Lock, PackageCheck, ClipboardCheck, BellRing } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import AuthBackdrop from '../components/AuthBackdrop'
import Button from '../components/Button'

const homeByRole = {
  admin: '/admin/comptes',
  gestionnaire: '/gestion/tableau-de-bord',
  utilisateur: '/app/articles',
}

const features = [
  { icon: PackageCheck, title: 'Stock en temps réel', text: 'Niveaux, seuils et alertes toujours à jour.' },
  { icon: ClipboardCheck, title: 'Demandes en quelques clics', text: 'Composez, soumettez, suivez votre bon.' },
  { icon: BellRing, title: 'Notifications instantanées', text: 'Soyez prévenu dès qu’une décision tombe.' },
]

export default function Login() {
  const { currentUser, loading: sessionLoading, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (sessionLoading) return null
  if (currentUser) {
    return <Navigate to={homeByRole[currentUser.role] || '/connexion'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    navigate(homeByRole[result.user.role] || '/connexion', { replace: true })
  }

  return (
    <div className="relative min-h-dvh text-white">
      <AuthBackdrop />

      <div className="relative mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16">
        {/* ---------- Présentation ---------- */}
        <div className="hidden lg:block">
          <div className="animate-fade-up flex items-center gap-3">
            <Logo size={44} />
            <span className="text-xl font-bold tracking-tight">G-UGP</span>
          </div>
          <h1 className="animate-fade-up mt-10 text-5xl font-bold leading-[1.08] tracking-tight [animation-delay:80ms]">
            Le stock et les besoins,
            <br />
            <span className="text-gradient-gold">enfin limpides.</span>
          </h1>
          <p className="animate-fade-up mt-5 max-w-md text-base text-white/60 [animation-delay:160ms]">
            Gérez les articles, traitez les expressions de besoin et générez vos bons depuis un seul espace.
          </p>
          <ul className="stagger mt-10 space-y-3">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-soft/25 to-gold/5 text-gold-soft">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-sm text-white/55">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- Formulaire ---------- */}
        <div className="animate-scale-in mx-auto w-full max-w-md [animation-delay:120ms]">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <Logo size={56} className="drop-shadow-[0_10px_30px_rgb(242_199_110/0.25)]" />
            <p className="mt-4 text-2xl font-bold tracking-tight">G-UGP</p>
            <p className="mt-1 text-sm text-white/55">Gestion des stocks et expressions de besoins</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white p-6 text-ink shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] sm:p-8">
            <h2 className="text-2xl font-bold">Connexion</h2>
            <p className="mt-1.5 text-sm text-muted">Connectez-vous avec les identifiants fournis par votre administrateur.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-muted">Adresse e-mail</label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prenom.nom@ugp-boad.tg"
                    className="h-12 w-full rounded-xl border border-line bg-paper/60 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-muted">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-line bg-paper/60 pl-10 pr-11 text-sm text-ink placeholder:text-muted focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper-2 hover:text-ink"
                  >
                    {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {error ? (
                <p role="alert" className="animate-scale-in rounded-xl border border-danger/25 bg-danger-bg px-3.5 py-2.5 text-sm font-medium text-danger">
                  {error}
                </p>
              ) : null}

              <Button type="submit" variant="primary" size="lg" icon={LogIn} loading={loading} className="!mt-6 w-full">
                {loading ? 'Connexion…' : 'Se connecter'}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-white/40">© {new Date().getFullYear()} G-UGP · Accès réservé au personnel autorisé</p>
        </div>
      </div>
    </div>
  )
}
