import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { stockLevel, stockLevelConfig, articleStatusConfig, demandeStatusConfig } from '../../utils/status'
import { formatDate } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import PageHeader from '../../components/PageHeader'

export default function ArticleDetail() {
  const { id } = useParams()
  const { articles, mouvements, demandes, findUser, findProgramme } = useAppData()

  const article = articles.find((a) => a.id === id)
  if (!article) return <Navigate to="/gestion/articles" replace />

  const level = stockLevel(article.stock, article.seuil)
  const programme = findProgramme(article.programmeId)

  const mouvementsArticle = mouvements
    .filter((m) => m.articleId === id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const demandeursArticle = demandes
    .map((d) => {
      const ligne = d.lignes.find((l) => l.articleId === id)
      return ligne ? { demande: d, quantite: ligne.quantite } : null
    })
    .filter(Boolean)
    .sort((a, b) => (a.demande.date < b.demande.date ? 1 : -1))

  return (
    <div>
      <Link to="/gestion/articles" className="group mb-5 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-muted shadow-soft transition-colors hover:text-ink">
        <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Retour aux articles
      </Link>

      <PageHeader
        title={article.designation}
        description={`${article.reference} · ${programme?.nom || 'Programme inconnu'}`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-surface shadow-soft px-4 py-3">
          <p className="text-xs text-muted">Stock actuel</p>
          <p className="mt-1 text-lg font-semibold tabular text-ink">{article.stock} {article.unite.toLowerCase()}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface shadow-soft px-4 py-3">
          <p className="text-xs text-muted">Seuil minimum</p>
          <p className="mt-1 text-lg font-semibold tabular text-ink">{article.seuil} {article.unite.toLowerCase()}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface shadow-soft px-4 py-3">
          <p className="text-xs text-muted">Niveau</p>
          <div className="mt-1.5">
            {article.statut === 'disponible' ? <StatusPill config={stockLevelConfig[level]} size="sm" /> : <span className="text-sm text-muted">-</span>}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface shadow-soft px-4 py-3">
          <p className="text-xs text-muted">Statut</p>
          <div className="mt-1.5">
            <StatusPill config={articleStatusConfig[article.statut]} size="sm" />
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface shadow-soft px-4 py-3">
          <p className="text-xs text-muted">Catégorie</p>
          <p className="mt-1 text-sm text-ink">{article.categorie}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface shadow-soft px-4 py-3">
          <p className="text-xs text-muted">Programme</p>
          <p className="mt-1 text-sm text-ink">{programme?.nom || '-'}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface shadow-soft px-4 py-3">
          <p className="text-xs text-muted">Créé le</p>
          <p className="mt-1 text-sm text-ink">{formatDate(article.dateCreation)}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2.5 text-sm font-medium text-ink">Mouvements de stock ({mouvementsArticle.length})</p>
        {mouvementsArticle.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink/15 bg-surface/50 px-4 py-6 text-center text-sm text-muted">
            Aucun mouvement enregistré pour cet article.
          </p>
        ) : (
          <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3 font-medium text-right">Quantité</th>
                  <th scope="col" className="px-5 py-3">Provenance / Bénéficiaire</th>
                  <th scope="col" className="px-5 py-3">Référence</th>
                  <th scope="col" className="px-5 py-3">Effectué par</th>
                  <th scope="col" className="px-5 py-3">Observation</th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {mouvementsArticle.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-0">
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(m.date)}</td>
                    <td className={`px-5 py-3 text-right tabular font-medium ${m.type === 'entree' ? 'text-ok' : 'text-danger'}`}>
                      {m.type === 'entree' ? '+' : '-'}{m.quantite}
                    </td>
                    <td className="px-5 py-3 text-muted">{m.type === 'entree' ? m.provenance : m.beneficiaire || '-'}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{m.document || '-'}</td>
                    <td className="px-5 py-3 text-muted">{findUser(m.utilisateurId)?.nom || '-'}</td>
                    <td className="px-5 py-3 text-muted">{m.observation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="mb-2.5 text-sm font-medium text-ink">Expressions de besoin sur cet article ({demandeursArticle.length})</p>
        {demandeursArticle.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink/15 bg-surface/50 px-4 py-6 text-center text-sm text-muted">
            Aucune demande n'a encore porté sur cet article.
          </p>
        ) : (
          <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-5 py-3">Numéro</th>
                  <th scope="col" className="px-5 py-3">Demandeur</th>
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3 font-medium text-right">Quantité demandée</th>
                  <th scope="col" className="px-5 py-3">Statut</th>
                  <th scope="col" className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {demandeursArticle.map(({ demande, quantite }) => {
                  const demandeur = findUser(demande.demandeurId)
                  return (
                    <tr key={demande.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink">{demande.numero}</td>
                      <td className="px-5 py-3">
                        <p className="text-ink">{demandeur?.nom}</p>
                        <p className="text-xs text-muted">{demandeur?.poste}</p>
                      </td>
                      <td className="px-5 py-3 text-muted">{formatDate(demande.date)}</td>
                      <td className="px-5 py-3 text-right tabular text-ink">{quantite}</td>
                      <td className="px-5 py-3">
                        <StatusPill config={demandeStatusConfig[demande.statut]} size="sm" />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link to={`/gestion/demandes/${demande.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-ink hover:text-gold">
                          Détail <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
