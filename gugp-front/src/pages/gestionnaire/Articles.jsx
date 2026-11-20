import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Pencil, PowerOff, Power, PackageSearch, ChevronRight } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { stockLevel, stockLevelConfig, articleStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'

const emptyForm = { designation: '', categorie: '', unite: '', stock: 0, seuil: 0, programmeId: '' }

export default function Articles() {
  const { articles, categories, programmes, findProgramme, addArticle, updateArticle, toggleArticleStatus } = useAppData()
  const [query, setQuery] = useState('')
  const [categorie, setCategorie] = useState('Toutes les catégories')
  const [statut, setStatut] = useState('Tous les statuts')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const filtres = useMemo(() => {
    return articles.filter((a) => {
      const matchQuery =
        !query ||
        a.designation.toLowerCase().includes(query.toLowerCase()) ||
        a.reference.toLowerCase().includes(query.toLowerCase())
      const matchCategorie = categorie === 'Toutes les catégories' || a.categorie === categorie
      const matchStatut =
        statut === 'Tous les statuts' ||
        (statut === 'disponible' && a.statut === 'disponible') ||
        (statut === 'desactive' && a.statut === 'desactive')
      return matchQuery && matchCategorie && matchStatut
    })
  }, [articles, query, categorie, statut])

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, programmeId: programmes[0]?.id || '' })
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(article) {
    setEditing(article)
    setForm({
      designation: article.designation,
      categorie: article.categorie,
      unite: article.unite,
      stock: article.stock,
      seuil: article.seuil,
      programmeId: article.programmeId,
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    try {
      if (editing) {
        await updateArticle(editing.id, {
          designation: form.designation,
          categorie: form.categorie,
          unite: form.unite,
          stock: Number(form.stock),
          seuil: Number(form.seuil),
        })
      } else {
        await addArticle({
          designation: form.designation,
          categorie: form.categorie,
          unite: form.unite,
          stock: Number(form.stock),
          seuil: Number(form.seuil),
          programmeId: form.programmeId,
        })
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Gestion des articles"
        description="Créez, modifiez et désactivez les articles suivis dans le stock."
        actions={
          <Button variant="gold" icon={Plus} onClick={openCreate}>
            Nouvel article
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par référence ou désignation"
            type="search"
            aria-label="Rechercher"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm text-ink shadow-soft placeholder:text-muted"
          />
        </div>
        <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink shadow-soft">
          <option>Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={statut} onChange={(e) => setStatut(e.target.value)} className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink shadow-soft">
          <option value="Tous les statuts">Tous les statuts</option>
          <option value="disponible">Disponible</option>
          <option value="desactive">Désactivé</option>
        </select>
      </div>

      {filtres.length === 0 ? (
        <EmptyState icon={PackageSearch} title="Aucun article ne correspond" description="Modifiez les filtres ou créez un nouvel article." />
      ) : (
        <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-5 py-3">Référence</th>
                  <th scope="col" className="px-5 py-3">Désignation</th>
                  <th scope="col" className="px-5 py-3">Programme</th>
                  <th scope="col" className="px-5 py-3">Catégorie</th>
                  <th scope="col" className="px-5 py-3 font-medium text-right">Stock</th>
                  <th scope="col" className="px-5 py-3 font-medium text-right">Seuil</th>
                  <th scope="col" className="px-5 py-3">Niveau</th>
                  <th scope="col" className="px-5 py-3">Statut</th>
                  <th scope="col" className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {filtres.map((a) => {
                  const level = stockLevel(a.stock, a.seuil)
                  return (
                    <tr key={a.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted">{a.reference}</td>
                      <td className="px-5 py-3">
                        <Link to={`/gestion/articles/${a.id}`} className="font-medium text-ink hover:text-gold">{a.designation}</Link>
                        <p className="text-xs text-muted">{a.unite} · créé le {formatDate(a.dateCreation)}</p>
                      </td>
                      <td className="px-5 py-3 text-muted">{findProgramme(a.programmeId)?.nom || '-'}</td>
                      <td className="px-5 py-3 text-muted">{a.categorie}</td>
                      <td className="px-5 py-3 text-right tabular text-ink">{a.stock}</td>
                      <td className="px-5 py-3 text-right tabular text-muted">{a.seuil}</td>
                      <td className="px-5 py-3">
                        {a.statut === 'disponible' ? <StatusPill config={stockLevelConfig[level]} size="sm" /> : <span className="text-xs text-muted">-</span>}
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill config={articleStatusConfig[a.statut]} size="sm" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Link to={`/gestion/articles/${a.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper-2 hover:text-ink" aria-label={`Voir le détail de ${a.designation}`} title="Détail">
                            <ChevronRight size={15} />
                          </Link>
                          <button onClick={() => openEdit(a)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper-2 hover:text-ink" aria-label={`Modifier ${a.designation}`} title="Modifier">
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => toggleArticleStatus(a.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper-2 hover:text-ink"
                            aria-label={`${a.statut === 'disponible' ? 'Désactiver' : 'Activer'} ${a.designation}`}
                            title={a.statut === 'disponible' ? 'Désactiver' : 'Activer'}
                          >
                            {a.statut === 'disponible' ? <PowerOff size={15} /> : <Power size={15} />}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'article" : 'Nouvel article'}>
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Désignation</label>
            <input
              required
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Programme</label>
            {editing ? (
              <p className="rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-muted">
                {findProgramme(form.programmeId)?.nom}
              </p>
            ) : (
              <select
                required
                value={form.programmeId}
                onChange={(e) => setForm({ ...form, programmeId: e.target.value })}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
              >
                <option value="" disabled>Choisir</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Catégorie</label>
              <select
                required
                value={form.categorie}
                onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
              >
                <option value="" disabled>Choisir</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Unité</label>
              <input
                required
                placeholder="Paquet, Unité..."
                value={form.unite}
                onChange={(e) => setForm({ ...form, unite: e.target.value })}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Stock initial</label>
              <input
                type="number"
                min={0}
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm tabular"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Seuil minimum</label>
              <input
                type="number"
                min={0}
                required
                value={form.seuil}
                onChange={(e) => setForm({ ...form, seuil: e.target.value })}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm tabular"
              />
            </div>
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
    </div>
  )
}
