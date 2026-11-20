import { useState } from 'react'
import { Plus, Pencil, Users2, X, FolderKanban } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import StatusPill from '../../components/StatusPill'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'

const statutConfig = {
  true: { label: 'Actif', color: 'text-ok', dot: 'bg-ok', bg: 'bg-ok-bg' },
  false: { label: 'Inactif', color: 'text-muted', dot: 'bg-muted', bg: 'bg-paper-2' },
}

const emptyForm = { nom: '', code: '' }

export default function Programmes() {
  const { programmes, users, addProgramme, updateProgramme, addMembreProgramme, removeMembreProgramme } = useAppData()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const [membresTarget, setMembresTarget] = useState(null)
  const [addUserId, setAddUserId] = useState('')

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(programme) {
    setEditing(programme)
    setForm({ nom: programme.nom, code: programme.code || '' })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    try {
      const payload = { nom: form.nom, code: form.code.trim() || undefined }
      if (editing) await updateProgramme(editing.id, payload)
      else await addProgramme(payload)
      setModalOpen(false)
    } catch (err) {
      setFormError(err.message)
    }
  }

  async function handleToggleActif(programme) {
    await updateProgramme(programme.id, { actif: !programme.actif })
  }

  const membresProgramme = membresTarget ? programmes.find((p) => p.id === membresTarget.id) : null
  const gestionnairesAssignes = membresProgramme?.membres.filter((m) => m.user.role === 'gestionnaire') || []
  const utilisateursAssignes = membresProgramme?.membres.filter((m) => m.user.role === 'utilisateur') || []
  const assignedIds = new Set(membresProgramme?.membres.map((m) => m.userId))
  const candidats = users.filter((u) => u.actif && !assignedIds.has(u.id) && u.role !== 'admin')

  async function handleAddMembre() {
    if (!addUserId || !membresTarget) return
    await addMembreProgramme(membresTarget.id, addUserId)
    setAddUserId('')
  }

  async function handleRemoveMembre(userId) {
    await removeMembreProgramme(membresTarget.id, userId)
  }

  return (
    <div>
      <PageHeader
        title="Programmes"
        description="Rattachez les articles et le stock à un programme, et déterminez qui peut y gérer le stock ou y soumettre des expressions de besoin."
        actions={
          <Button variant="gold" icon={Plus} onClick={openCreate}>
            Nouveau programme
          </Button>
        }
      />

      {programmes.length === 0 ? (
        <EmptyState icon={FolderKanban} title="Aucun programme" description="Créez le premier programme pour commencer à y rattacher des articles." />
      ) : (
        <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-5 py-3">Programme</th>
                  <th scope="col" className="px-5 py-3">Code</th>
                  <th scope="col" className="px-5 py-3">Gestionnaires</th>
                  <th scope="col" className="px-5 py-3">Utilisateurs</th>
                  <th scope="col" className="px-5 py-3">Statut</th>
                  <th scope="col" className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {programmes.map((p) => {
                  const gestionnaires = p.membres.filter((m) => m.user.role === 'gestionnaire')
                  const utilisateurs = p.membres.filter((m) => m.user.role === 'utilisateur')
                  return (
                    <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="max-w-xs px-5 py-3 font-medium text-ink">{p.nom}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted">{p.code || '-'}</td>
                      <td className="px-5 py-3 text-muted">{gestionnaires.length}</td>
                      <td className="px-5 py-3 text-muted">{utilisateurs.length}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleToggleActif(p)}>
                          <StatusPill config={statutConfig[String(p.actif)]} size="sm" />
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setMembresTarget(p)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper-2 hover:text-ink" aria-label={`Gérer les membres de ${p.nom}`} title="Gérer les membres">
                            <Users2 size={15} />
                          </button>
                          <button onClick={() => openEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper-2 hover:text-ink" aria-label={`Modifier ${p.nom}`} title="Modifier">
                            <Pencil size={15} />
                          </button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le programme' : 'Nouveau programme'}>
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Nom du programme</label>
            <input
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Code (optionnel)</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Ex. PURS"
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
            />
          </div>
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="gold">
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!membresTarget} onClose={() => setMembresTarget(null)} title={`Membres — ${membresTarget?.nom || ''}`} width="max-w-lg">
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[220px] flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted">Ajouter un gestionnaire ou un utilisateur</label>
              <select
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
              >
                <option value="">Choisir un compte</option>
                {candidats.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nom} — {u.role === 'gestionnaire' ? 'Gestionnaire' : 'Utilisateur'}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" variant="secondary" icon={Plus} disabled={!addUserId} onClick={handleAddMembre}>
              Ajouter
            </Button>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted">Gestionnaires ({gestionnairesAssignes.length})</p>
            {gestionnairesAssignes.length === 0 ? (
              <p className="text-sm text-muted">Aucun gestionnaire assigné.</p>
            ) : (
              <ul className="space-y-1.5">
                {gestionnairesAssignes.map((m) => (
                  <li key={m.userId} className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2.5 text-sm">
                    <span className="text-ink">{m.user.nom}</span>
                    <button onClick={() => handleRemoveMembre(m.userId)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-bg hover:text-danger" aria-label={`Retirer ${m.user.nom}`}>
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted">Utilisateurs ({utilisateursAssignes.length})</p>
            {utilisateursAssignes.length === 0 ? (
              <p className="text-sm text-muted">Aucun utilisateur assigné.</p>
            ) : (
              <ul className="space-y-1.5">
                {utilisateursAssignes.map((m) => (
                  <li key={m.userId} className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2.5 text-sm">
                    <span className="text-ink">{m.user.nom}</span>
                    <button onClick={() => handleRemoveMembre(m.userId)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-bg hover:text-danger" aria-label={`Retirer ${m.user.nom}`}>
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
