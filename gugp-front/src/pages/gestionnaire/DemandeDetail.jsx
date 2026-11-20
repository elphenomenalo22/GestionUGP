import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, X, FileCheck2, MessageSquareWarning, TriangleAlert } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { demandeStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import Button from '../../components/Button'
import Modal from '../../components/Modal'

export default function DemandeDetail() {
  const { id } = useParams()
  const { demandes, findUser, findArticle, approuverDemande, rejeterDemande } = useAppData()
  const navigate = useNavigate()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')
  const [busy, setBusy] = useState(null)
  const [actionError, setActionError] = useState('')

  const demande = demandes.find((d) => d.id === id)
  if (!demande) return <Navigate to="/gestion/demandes" replace />

  const demandeur = findUser(demande.demandeurId)

  async function handleApprove() {
    setActionError('')
    setBusy('approve')
    try {
      await approuverDemande(demande.id)
    } catch (err) {
      setActionError(err.message || "La demande n'a pas pu être approuvée.")
    } finally {
      setBusy(null)
    }
  }

  async function confirmReject() {
    if (!motifRejet.trim()) return
    setActionError('')
    setBusy('reject')
    try {
      await rejeterDemande(demande.id, motifRejet.trim())
      setRejectOpen(false)
    } catch (err) {
      setActionError(err.message || "La demande n'a pas pu être rejetée.")
      setRejectOpen(false)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/gestion/demandes" className="group mb-5 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-muted shadow-soft transition-colors hover:text-ink">
        <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Demandes à traiter
      </Link>

      <div className="rounded-2xl border border-line bg-surface shadow-soft p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="font-mono text-xs text-muted">{demande.numero}</p>
            <h1 className="mt-0.5 text-lg font-semibold text-ink">Expression de besoin</h1>
          </div>
          <StatusPill config={demandeStatusConfig[demande.statut]} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted">Demandeur</p>
            <p className="mt-0.5 font-medium text-ink">{demandeur?.nom}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Poste</p>
            <p className="mt-0.5 text-ink">{demandeur?.poste}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Date</p>
            <p className="mt-0.5 text-ink">{formatDate(demande.date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Nombre d'articles</p>
            <p className="mt-0.5 tabular text-ink">{demande.lignes.length}</p>
          </div>
        </div>

        <div className="mt-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className="py-2">Article</th>
                <th scope="col" className="py-1.5 font-medium text-right">Quantité</th>
                <th scope="col" className="py-1.5 font-medium text-right">Stock actuel</th>
              </tr>
            </thead>
            <tbody className="stagger-rows">
              {demande.lignes.map((ligne) => {
                const article = findArticle(ligne.articleId)
                const depasse = article && ligne.quantite > article.stock
                return (
                  <tr key={ligne.articleId} className="border-t border-line">
                    <td className="py-2 text-ink">{article?.designation || 'Article supprimé'}</td>
                    <td className="py-2 text-right tabular text-ink">{ligne.quantite}</td>
                    <td className={`py-2 text-right tabular ${depasse ? 'font-medium text-danger' : 'text-muted'}`}>{article?.stock}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {demande.motif ? (
          <div className="mt-4 rounded-xl bg-paper px-4 py-3">
            <p className="text-xs font-medium text-muted">Motif</p>
            <p className="mt-0.5 text-sm text-ink">{demande.motif}</p>
          </div>
        ) : null}

        {actionError ? (
          <p role="alert" className="animate-scale-in mt-5 flex items-start gap-2 rounded-xl border border-danger/25 bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
            <TriangleAlert size={16} className="mt-px shrink-0" aria-hidden="true" /> {actionError}
          </p>
        ) : null}

        {demande.statut === 'en_attente' ? (
          <div className="mt-6 flex justify-end gap-2 border-t border-line pt-5">
            <Button variant="danger" icon={X} disabled={!!busy} onClick={() => setRejectOpen(true)}>Rejeter</Button>
            <Button variant="gold" icon={Check} loading={busy === 'approve'} onClick={handleApprove}>
              {busy === 'approve' ? 'Approbation…' : 'Approuver et générer le bon'}
            </Button>
          </div>
        ) : null}

        {demande.statut === 'rejetee' ? (
          <div className="mt-5 flex gap-2.5 rounded-xl bg-danger-bg px-4 py-3">
            <MessageSquareWarning size={16} className="mt-0.5 shrink-0 text-danger" />
            <div>
              <p className="text-xs font-medium text-danger">Motif du rejet, communiqué le {formatDate(demande.dateTraitement)}</p>
              <p className="mt-0.5 text-sm text-ink">{demande.motifRejet}</p>
            </div>
          </div>
        ) : null}

        {demande.statut === 'approuvee' ? (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-gold/30 bg-gold-bg/50 px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-ink">Bon {demande.bonNumero}</p>
              <p className="text-xs text-muted">Validé le {formatDate(demande.dateTraitement)}</p>
            </div>
            <Button variant="secondary" icon={FileCheck2} size="sm" onClick={() => navigate(`/bon/${demande.id}`)}>
              Voir le bon
            </Button>
          </div>
        ) : null}
      </div>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title={`Rejeter ${demande.numero}`}>
        <p className="mb-3 text-sm text-muted">Précisez le motif du rejet. Il sera visible par le demandeur.</p>
        <textarea
          autoFocus
          rows={3}
          value={motifRejet}
          onChange={(e) => setMotifRejet(e.target.value)}
          placeholder="Ex. quantité demandée supérieure au stock disponible"
          className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRejectOpen(false)}>Annuler</Button>
          <Button variant="danger" loading={busy === 'reject'} disabled={!motifRejet.trim()} onClick={confirmReject}>Confirmer le rejet</Button>
        </div>
      </Modal>
    </div>
  )
}
