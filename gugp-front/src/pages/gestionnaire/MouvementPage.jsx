import { useMemo, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, CircleCheck, TriangleAlert, ArrowRight, Inbox } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { formatDate, uniteLabel } from '../../utils/format'
import { stockLevel, stockLevelConfig } from '../../utils/status'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import ArticleCombobox from '../../components/ArticleCombobox'
import QuantityStepper from '../../components/QuantityStepper'
import StockGauge from '../../components/StockGauge'

const configs = {
  entree: {
    eyebrow: 'Approvisionnement',
    title: 'Entrées de stock',
    description: 'Enregistrez un nouvel approvisionnement : le stock est mis à jour automatiquement.',
    formTitle: 'Nouvelle entrée',
    qtyLabel: 'Quantité reçue',
    partyKey: 'provenance',
    partyLabel: 'Fournisseur ou provenance',
    partyPlaceholder: 'Ex. Fournisseur ABC',
    docPlaceholder: 'BL-2026-0001',
    submitLabel: "Enregistrer l'entrée",
    icon: ArrowDownToLine,
    sign: '+',
    tone: 'text-ok',
    iconTone: 'from-ok/20 to-ok/5 text-ok',
    histTitle: 'Historique des entrées',
    partyCol: 'Provenance',
    emptyHist: 'Aucune entrée enregistrée.',
  },
  sortie: {
    eyebrow: 'Distribution',
    title: 'Sorties de stock',
    description: "Enregistrez une remise d'articles à un service : le stock est mis à jour automatiquement.",
    formTitle: 'Nouvelle sortie',
    qtyLabel: 'Quantité à sortir',
    partyKey: 'beneficiaire',
    partyLabel: 'Bénéficiaire',
    partyPlaceholder: 'Ex. Direction Technique',
    docPlaceholder: 'BS-2026-0001',
    submitLabel: 'Enregistrer la sortie',
    icon: ArrowUpFromLine,
    sign: '−',
    tone: 'text-danger',
    iconTone: 'from-gold/25 to-gold/5 text-gold-2',
    histTitle: 'Historique des sorties',
    partyCol: 'Bénéficiaire',
    emptyHist: 'Aucune sortie enregistrée.',
  },
}

const emptyForm = { articleId: '', quantite: 1, party: '', document: '', observation: '' }

export default function MouvementPage({ type }) {
  const cfg = configs[type]
  const { articles, mouvements, findArticle, addMouvement } = useAppData()
  const [form, setForm] = useState(emptyForm)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [lastId, setLastId] = useState(null)

  const disponibles = useMemo(() => articles.filter((a) => a.statut === 'disponible'), [articles])
  const historique = useMemo(
    () => mouvements.filter((m) => m.type === type).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [mouvements, type]
  )
  const article = findArticle(form.articleId)
  const quantite = Number(form.quantite) || 0
  const apres = article ? (type === 'entree' ? article.stock + quantite : article.stock - quantite) : null
  const insuffisant = type === 'sortie' && article && quantite > article.stock
  const Icon = cfg.icon

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }))
    setError(null)
    setFeedback(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!article || saving) return
    if (insuffisant) {
      setError(`Stock insuffisant : ${article.stock} ${uniteLabel(article.stock, article.unite)} disponibles.`)
      return
    }
    setSaving(true)
    setError(null)
    const designation = article.designation
    const result = await addMouvement({
      type,
      articleId: form.articleId,
      quantite,
      [cfg.partyKey]: form.party,
      document: form.document,
      observation: form.observation,
    })
    setSaving(false)
    if (result.ok) {
      setFeedback(`${type === 'entree' ? 'Entrée' : 'Sortie'} enregistrée : ${cfg.sign}${quantite} ${designation}. Stock actuel : ${apres}.`)
      setLastId(result.mouvement?.id || null)
      setForm(emptyForm)
    } else {
      setError(result.message || "L'opération n'a pas pu être enregistrée.")
    }
  }

  const apresLevel = article ? stockLevel(Math.max(0, apres), article.seuil) : 'normal'

  return (
    <div>
      <PageHeader eyebrow={cfg.eyebrow} title={cfg.title} description={cfg.description} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <form
          onSubmit={handleSubmit}
          className="animate-fade-up rounded-2xl border border-line bg-surface p-5 shadow-soft lg:sticky lg:top-24 lg:col-span-2 sm:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.iconTone}`}>
              <Icon size={19} aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold text-ink">{cfg.formTitle}</h2>
          </div>

          <div className="space-y-4">
            <ArticleCombobox articles={disponibles} value={form.articleId} onChange={(id) => update({ articleId: id })} />

            <div>
              <p className="mb-1.5 text-xs font-medium text-muted">{cfg.qtyLabel}</p>
              <div className="flex flex-wrap items-center gap-3">
                <QuantityStepper
                  value={quantite || 1}
                  min={1}
                  max={type === 'sortie' && article ? Math.max(1, article.stock) : undefined}
                  label={article?.designation}
                  onChange={(v) => update({ quantite: v })}
                />
                {article ? (
                  <div className="flex items-center gap-1.5 text-sm tabular">
                    <span className="text-muted">{article.stock}</span>
                    <ArrowRight size={14} className="text-muted" aria-hidden="true" />
                    <span key={apres} className={`animate-pop font-bold ${apres < 0 ? 'text-danger' : stockLevelConfig[apresLevel].color}`}>
                      {apres}
                    </span>
                    <span className="text-xs text-muted">{uniteLabel(apres, article.unite)} après</span>
                  </div>
                ) : null}
              </div>
              {article ? <StockGauge stock={Math.max(0, apres)} seuil={article.seuil} className="mt-3" /> : null}
            </div>

            <div>
              <label htmlFor={`${type}-party`} className="mb-1.5 block text-xs font-medium text-muted">{cfg.partyLabel}</label>
              <input
                id={`${type}-party`}
                value={form.party}
                onChange={(e) => update({ party: e.target.value })}
                placeholder={cfg.partyPlaceholder}
                className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm placeholder:text-muted"
              />
            </div>
            <div>
              <label htmlFor={`${type}-doc`} className="mb-1.5 block text-xs font-medium text-muted">Numéro du document</label>
              <input
                id={`${type}-doc`}
                placeholder={cfg.docPlaceholder}
                value={form.document}
                onChange={(e) => update({ document: e.target.value })}
                className="h-10 w-full rounded-xl border border-line bg-surface px-3 font-mono text-sm placeholder:text-muted"
              />
            </div>
            <div>
              <label htmlFor={`${type}-obs`} className="mb-1.5 block text-xs font-medium text-muted">Observation</label>
              <textarea
                id={`${type}-obs`}
                rows={2}
                value={form.observation}
                onChange={(e) => update({ observation: e.target.value })}
                className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2 text-sm"
              />
            </div>

            <Button type="submit" variant="gold" size="lg" icon={Icon} loading={saving} disabled={!article || insuffisant} className="w-full">
              {saving ? 'Enregistrement…' : cfg.submitLabel}
            </Button>

            {error ? (
              <p role="alert" className="animate-scale-in flex items-start gap-2 rounded-xl bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">
                <TriangleAlert size={16} className="mt-px shrink-0" aria-hidden="true" /> {error}
              </p>
            ) : null}
            <div role="status" aria-live="polite">
              {feedback ? (
                <p className="animate-scale-in flex items-start gap-2 rounded-xl bg-ok-bg px-3 py-2.5 text-sm font-medium text-ok">
                  <CircleCheck size={16} className="mt-px shrink-0" aria-hidden="true" /> {feedback}
                </p>
              ) : null}
            </div>
          </div>
        </form>

        <section className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface shadow-soft lg:col-span-3">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-ink">{cfg.histTitle}</h2>
            <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-xs font-semibold tabular text-muted">{historique.length}</span>
          </div>
          {historique.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
              <Inbox size={22} className="text-muted" aria-hidden="true" />
              <p className="text-sm text-muted">{cfg.emptyHist}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th scope="col" className="px-5 py-2.5">Date</th>
                    <th scope="col" className="px-5 py-2.5">Article</th>
                    <th scope="col" className="px-5 py-2.5 text-right">Quantité</th>
                    <th scope="col" className="px-5 py-2.5">{cfg.partyCol}</th>
                    <th scope="col" className="px-5 py-2.5">Document</th>
                  </tr>
                </thead>
                <tbody className="stagger-rows">
                  {historique.map((m) => (
                    <tr key={m.id} className={`border-b border-line last:border-0 hover:bg-paper/60 ${m.id === lastId ? 'bg-gold-bg/60' : ''}`}>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(m.date)}</td>
                      <td className="px-5 py-3 font-medium text-ink">{findArticle(m.articleId)?.designation}</td>
                      <td className={`px-5 py-3 text-right font-bold tabular ${cfg.tone}`}>
                        {cfg.sign}
                        {m.quantite}
                      </td>
                      <td className="px-5 py-3 text-muted">{m[cfg.partyKey] || '-'}</td>
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted">{m.document || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
