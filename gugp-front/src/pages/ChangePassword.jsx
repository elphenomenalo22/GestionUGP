import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthBackdrop from '../components/AuthBackdrop'
import Logo from '../components/Logo'
import Button from '../components/Button'

const homeByRole = {
  admin: '/admin/comptes',
  gestionnaire: '/gestion/tableau-de-bord',
  utilisateur: '/app/articles',
}

export default function ChangePassword() {
  const { currentUser, loading: sessionLoading, changePassword } = useAuth()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (sessionLoading) return null
  if (!currentUser) return <Navigate to="/connexion" replace />

  const forced = currentUser.mustChangePassword

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.')
      return
    }
    setLoading(true)
    try {
      const user = await changePassword(currentPassword, newPassword)
      navigate(homeByRole[user.role] || '/connexion', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-12">
      <AuthBackdrop />
      <div className="animate-scale-in relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Logo size={44} />
          {!forced ? (
            <Link to={homeByRole[currentUser.role] || '/connexion'} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white">
              <ArrowLeft size={15} aria-hidden="true" /> Retour
            </Link>
          ) : null}
        </div>
        <div className="rounded-3xl border border-white/10 bg-white p-6 text-ink shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] sm:p-8">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 text-gold-2">
          <KeyRound size={22} aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-bold text-ink">Changer de mot de passe</h1>
        <p className="mt-1.5 text-sm text-muted">
          {forced
            ? 'Pour des raisons de sécurité, vous devez choisir un nouveau mot de passe avant de continuer.'
            : 'Choisissez un nouveau mot de passe pour votre compte.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="pwd-current" className="mb-1.5 block text-xs font-medium text-muted">Mot de passe actuel</label>
            <input
              id="pwd-current"
              type={showPasswords ? 'text' : 'password'}
              autoComplete="current-password"
              required
              autoFocus
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-12 rounded-xl border border-line bg-paper/60 px-3.5 focus:bg-white text-sm text-ink focus:border-ink/40"
            />
          </div>

          <div>
            <label htmlFor="pwd-new" className="mb-1.5 block text-xs font-medium text-muted">Nouveau mot de passe</label>
            <div className="relative">
              <input
                id="pwd-new"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 rounded-xl border border-line bg-paper/60 px-3.5 focus:bg-white pr-10 text-sm text-ink focus:border-ink/40"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                aria-label={showPasswords ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper-2 hover:text-ink"
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="pwd-confirm" className="mb-1.5 block text-xs font-medium text-muted">Confirmer le nouveau mot de passe</label>
            <input
              id="pwd-confirm"
              type={showPasswords ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 rounded-xl border border-line bg-paper/60 px-3.5 focus:bg-white text-sm text-ink focus:border-ink/40"
            />
          </div>

          {error ? (
            <p role="alert" className="animate-scale-in rounded-xl border border-danger/25 bg-danger-bg px-3.5 py-2.5 text-sm font-medium text-danger">{error}</p>
          ) : null}

          <Button type="submit" variant="gold" size="lg" icon={KeyRound} loading={loading} className="!mt-6 w-full">
            {loading ? 'Enregistrement…' : 'Changer le mot de passe'}
          </Button>
        </form>
        </div>
      </div>
    </div>
  )
}
