import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ClipboardList, FileCheck2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { demandeStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import Tabs from '../../components/Tabs'

const filters = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'approuvee', label: 'Approuvées' },
  { key: 'rejetee', label: 'Rejetées' },
]

export default function MesDemandes() {
  const { currentUser } = useAuth()
  const { demandes, findArticle } = useAppData()
  const [filter, setFilter] = useState('toutes')

  const mine = demandes
    .filter((d) => d.demandeurId === currentUser.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const visible = filter === 'toutes' ? mine : mine.filter((d) => d.statut === filter)

  return (
    <div>
      <PageHeader title="Mes demandes" description="Suivez l'état de vos expressions de besoin et retrouvez vos bons validés." />

      <Tabs
        className="animate-fade-up mb-5"
        label="Filtrer par statut"
        value={filter}
        onChange={setFilter}
        items={filters.map((f) => ({ ...f, count: f.key === 'toutes' ? mine.length : mine.filter((d) => d.statut === f.key).length }))}
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucune demande ici"
          description="Les expressions de besoin que vous soumettez apparaîtront dans cette liste."
        />
      ) : (
        <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-5 py-3">Numéro</th>
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3">Articles</th>
                  <th scope="col" className="px-5 py-3">Statut</th>
                  <th scope="col" className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {visible.map((d) => (
                  <tr key={d.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink">{d.numero}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(d.date)}</td>
                    <td className="px-5 py-3 text-muted">
                      {d.lignes.length} article{d.lignes.length > 1 ? 's' : ''}
                      <span className="ml-1 text-xs text-muted/70">
                        ({d.lignes.map((l) => findArticle(l.articleId)?.designation).filter(Boolean).join(', ')})
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill config={demandeStatusConfig[d.statut]} size="sm" />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {d.statut === 'approuvee' ? (
                          <Link
                            to={`/bon/${d.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-gold"
                          >
                            <FileCheck2 size={14} /> Bon
                          </Link>
                        ) : null}
                        <Link
                          to={`/app/mes-demandes/${d.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-gold"
                        >
                          Détail <ChevronRight size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
