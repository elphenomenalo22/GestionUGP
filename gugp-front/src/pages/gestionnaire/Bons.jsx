import { Link } from 'react-router-dom'
import { FileCheck2 } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { formatDate } from '../../utils/format'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import { buttonClasses } from '../../components/buttonStyles'

export default function Bons() {
  const { demandes, findUser } = useAppData()
  const bons = demandes.filter((d) => d.statut === 'approuvee').sort((a, b) => (a.dateTraitement < b.dateTraitement ? 1 : -1))

  return (
    <div>
      <PageHeader title="Bons générés" description="Retrouvez et imprimez les bons de sortie issus des demandes approuvées." />

      {bons.length === 0 ? (
        <EmptyState icon={FileCheck2} title="Aucun bon pour le moment" description="Un bon est généré automatiquement dès qu'une demande est approuvée." />
      ) : (
        <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-5 py-3">Bon</th>
                  <th scope="col" className="px-5 py-3">Demande liée</th>
                  <th scope="col" className="px-5 py-3">Demandeur</th>
                  <th scope="col" className="px-5 py-3">Date de validation</th>
                  <th scope="col" className="px-5 py-3 font-medium text-right">Articles</th>
                  <th scope="col" className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {bons.map((d) => {
                  const demandeur = findUser(d.demandeurId)
                  return (
                    <tr key={d.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink">{d.bonNumero}</td>
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted">{d.numero}</td>
                      <td className="px-5 py-3 text-ink">{demandeur?.nom}</td>
                      <td className="px-5 py-3 text-muted">{formatDate(d.dateTraitement)}</td>
                      <td className="px-5 py-3 text-right tabular text-muted">{d.lignes.length}</td>
                      <td className="px-5 py-3 text-right">
                        <Link to={`/bon/${d.id}`} target="_blank" className={buttonClasses('secondary', 'sm')} aria-label={`Voir le bon ${d.bonNumero}`}>
                          <FileCheck2 size={14} aria-hidden="true" /> Voir
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
