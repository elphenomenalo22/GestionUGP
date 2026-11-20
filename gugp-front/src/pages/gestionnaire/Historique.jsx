import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppData } from '../../context/AppDataContext'
import { demandeStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import PageHeader from '../../components/PageHeader'
import StatusPill from '../../components/StatusPill'
import Tabs from '../../components/Tabs'

const tabs = [
  { key: 'entrees', label: 'Entrées' },
  { key: 'sorties', label: 'Sorties' },
  { key: 'demandes', label: 'Expressions de besoin' },
]

const tabKeys = tabs.map((t) => t.key)

export default function Historique() {
  const { mouvements, demandes, findArticle, findUser } = useAppData()
  const [searchParams] = useSearchParams()
  const ongletParam = searchParams.get('onglet')
  const moisEnCours = searchParams.get('periode') === 'mois'
  const [tab, setTab] = useState(tabKeys.includes(ongletParam) ? ongletParam : 'entrees')

  const now = new Date()
  const dansLeMois = (m) => {
    if (!moisEnCours) return true
    const d = new Date(m.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }

  const entrees = mouvements.filter((m) => m.type === 'entree' && dansLeMois(m)).sort((a, b) => (a.date < b.date ? 1 : -1))
  const sorties = mouvements.filter((m) => m.type === 'sortie' && dansLeMois(m)).sort((a, b) => (a.date < b.date ? 1 : -1))
  const demandesTriees = [...demandes].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div>
      <PageHeader
        title="Historique"
        description={moisEnCours ? 'Opérations du mois en cours uniquement.' : 'Toutes les opérations sont conservées pour assurer une traçabilité complète.'}
      />

      <Tabs
        className="animate-fade-up mb-5"
        label="Type d'opération"
        value={tab}
        onChange={setTab}
        items={[
          { ...tabs[0], count: entrees.length },
          { ...tabs[1], count: sorties.length },
          { ...tabs[2], count: demandesTriees.length },
        ]}
      />

      {tab === 'entrees' ? (
        <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3">Article</th>
                  <th scope="col" className="px-5 py-3 font-medium text-right">Quantité</th>
                  <th scope="col" className="px-5 py-3">Provenance</th>
                  <th scope="col" className="px-5 py-3">Référence</th>
                  <th scope="col" className="px-5 py-3">Observation</th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {entrees.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-0">
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(m.date)}</td>
                    <td className="px-5 py-3 text-ink">{findArticle(m.articleId)?.designation}</td>
                    <td className="px-5 py-3 text-right tabular font-medium text-ok">+{m.quantite}</td>
                    <td className="px-5 py-3 text-muted">{m.provenance || '-'}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{m.document || '-'}</td>
                    <td className="px-5 py-3 text-muted">{m.observation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === 'sorties' ? (
        <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3">Article</th>
                  <th scope="col" className="px-5 py-3 font-medium text-right">Quantité</th>
                  <th scope="col" className="px-5 py-3">Bénéficiaire</th>
                  <th scope="col" className="px-5 py-3">Référence du bon</th>
                  <th scope="col" className="px-5 py-3">Observation</th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {sorties.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-0">
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(m.date)}</td>
                    <td className="px-5 py-3 text-ink">{findArticle(m.articleId)?.designation}</td>
                    <td className="px-5 py-3 text-right tabular font-medium text-danger">-{m.quantite}</td>
                    <td className="px-5 py-3 text-muted">{m.beneficiaire || '-'}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{m.document || '-'}</td>
                    <td className="px-5 py-3 text-muted">{m.observation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === 'demandes' ? (
        <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-5 py-3">Numéro</th>
                  <th scope="col" className="px-5 py-3">Demandeur</th>
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3">Statut</th>
                  <th scope="col" className="px-5 py-3">Validateur</th>
                  <th scope="col" className="px-5 py-3">Date de validation</th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {demandesTriees.map((d) => (
                  <tr key={d.id} className="border-b border-line last:border-0">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink">{d.numero}</td>
                    <td className="px-5 py-3 text-ink">{findUser(d.demandeurId)?.nom}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(d.date)}</td>
                    <td className="px-5 py-3"><StatusPill config={demandeStatusConfig[d.statut]} size="sm" /></td>
                    <td className="px-5 py-3 text-muted">{d.traitePar ? findUser(d.traitePar)?.nom : '-'}</td>
                    <td className="px-5 py-3 text-muted">{d.dateTraitement ? formatDate(d.dateTraitement) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
