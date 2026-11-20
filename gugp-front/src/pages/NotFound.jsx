import { Link } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'
import AuthBackdrop from '../components/AuthBackdrop'

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center text-white">
      <AuthBackdrop />
      <div className="animate-scale-in relative flex flex-col items-center">
        <p className="text-gradient-gold text-[7rem] font-bold leading-none tracking-tighter sm:text-[9rem]">404</p>
        <span className="mt-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gold-soft">
          <Compass size={22} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Cette page n'existe pas</h1>
        <p className="mt-2 max-w-sm text-sm text-white/60">
          L'adresse saisie ne correspond à aucun écran de G-UGP. Retournez à la connexion pour choisir un espace.
        </p>
        <Link
          to="/connexion"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-gold-soft to-gold px-5 text-sm font-bold text-ink-2 shadow-[0_10px_30px_-8px_rgb(242_199_110/0.6)] transition-transform hover:-translate-y-0.5"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Revenir à la connexion
        </Link>
      </div>
    </div>
  )
}
