import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, ClipboardCheck, Check, X, LoaderCircle, TriangleAlert } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { demandeStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Tabs from '../../components/Tabs'

const filters = [
  { key: 'en_attente', label: 'En attente' },
  { key: 'approuvee', label: 'Approuvées' },
  { key: 'rejetee', label: 'Rejetées' },
  { key: 'toutes', label: 'Toutes' },
]

const filterKeys = filters.map((f) => f.key)

export default function Demandes() {
  const { demandes, findUser, findArticle, approuverDemande, rejeterDemande } = useAppData()
  const [searchParams] = useSearchParams()
  const statutParam = searchParams.get('statut')
  const [filter, setFilter] = useState(filterKeys.includes(statutParam) ? statutParam : 'en_attente')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [motifRejet, setMotifRejet] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')

  const sorted = [...demandes].sort((a, b) => (a.date < b.date ? 1 : -1))
  const visible = filter === 'toutes' ? sorted : sorted.filter((d) => d.statut === filter)

  async function handleApprove(id) {
    setActionError('')
    setBusyId(id)
    try {
      await approuverDemande(id)
    } catch (err) {
      setActionError(err.message || "La demande n'a pas pu être approuvée.")
    } finally {
      setBusyId(null)
    }
  }

  async function confirmReject() {
    if (!motifRejet.trim()) return
    setActionError('')
    setBusyId(rejectTarget.id)
    try {
      await rejeterDemande(rejectTarget.id, motifRejet.trim())
      setRejectTarget(null)
      setMotifRejet('')
    } catch (err) {
      setActionError(err.message || "La demande n'a pas pu être rejetée.")
      setRejectTarget(null)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader title="Demandes à traiter" description="Approuvez ou rejetez les expressions de besoin soumises par les utilisateurs." />

      <Tabs
        className="animate-fade-up mb-5"
        label="Filtrer par statut"
        value={filter}
        onChange={setFilter}
        items={filters.map((f) => ({ ...f, count: f.key === 'toutes' ? demandes.length : demandes.filter((d) => d.statut === f.key).length }))}
      />

      {actionError ? (
        <p role="alert" className="animate-scale-in mb-4 flex items-start gap-2 rounded-xl border border-danger/25 bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
          <TriangleAlert size={16} className="mt-px shrink-0" aria-hidden="true" /> {actionError}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Rien à traiter ici" description="Les demandes correspondant à ce filtre apparaîtront dans cette liste." />
      ) : (
        <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-5 py-3">Numéro</th>
                  <th scope="col" className="px-5 py-3">Demandeur</th>
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3">Articles</th>
                  <th scope="col" className="px-5 py-3">Statut</th>
                  <th scope="col" className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {visible.map((d) => {
                  const demandeur = findUser(d.demandeurId)
                  return (
                    <tr key={d.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink">{d.numero}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{demandeur?.nom}</p>
                        <p className="text-xs text-muted">{demandeur?.poste}</p>
                      </td>
                      <td className="px-5 py-3 text-muted">{formatDate(d.date)}</td>
                      <td className="px-5 py-3 text-muted">
                        {d.lignes.map((l) => findArticle(l.articleId)?.designation).filter(Boolean).join(', ')}
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill config={demandeStatusConfig[d.statut]} size="sm" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {d.statut === 'en_attente' ? (
                            <>
                              <button
                                onClick={() => handleApprove(d.id)}
                                disabled={busyId === d.id}
                                aria-label={`Approuver ${d.numero}`}
                                className="inline-flex h-8 items-center gap-1 rounded-lg bg-ok px-2.5 text-xs font-semibold text-white shadow-[0_4px_12px_-4px_rgb(22_121_74/0.6)] transition-transform hover:-translate-y-px active:scale-95 disabled:opacity-60"
                              >
                                {busyId === d.id ? <LoaderCircle size={13} className="animate-spin" aria-hidden="true" /> : <Check size={13} strokeWidth={2.75} aria-hidden="true" />} Approuver
                              </button>
                              <button
                                onClick={() => setRejectTarget(d)}
                                disabled={busyId === d.id}
                                aria-label={`Rejeter ${d.numero}`}
                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-danger/30 bg-surface px-2.5 text-xs font-semibold text-danger transition-colors hover:bg-danger-bg disabled:opacity-60"
                              >
                                <X size={13} strokeWidth={2.75} aria-hidden="true" /> Rejeter
                              </button>
                            </>
                          ) : null}
                          <Link to={`/gestion/demandes/${d.id}`} aria-label={`Détail de ${d.numero}`} className="inline-flex h-8 items-center gap-0.5 rounded-lg px-2 text-xs font-semibold text-ink transition-colors hover:bg-paper-2 hover:text-gold-2">
                            Détail <ChevronRight size={14} aria-hidden="true" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title={`Rejeter ${rejectTarget?.numero || ''}`}>
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
          <Button variant="ghost" onClick={() => setRejectTarget(null)}>Annuler</Button>
          <Button variant="danger" loading={!!busyId} disabled={!motifRejet.trim()} onClick={confirmReject}>Confirmer le rejet</Button>
        </div>
      </Modal>
    </div>
  )
}
