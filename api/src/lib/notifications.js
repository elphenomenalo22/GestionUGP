import webpush from 'web-push'
import { prisma } from '../db.js'
import { sendMail } from './mailer.js'

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:contact@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
} else {
  console.warn('Attention : VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY non définis — les notifications push navigateur sont désactivées (le direct SSE reste actif).')
}

// Registre en mémoire des connexions SSE ouvertes, par utilisateur. Un même
// utilisateur peut avoir plusieurs onglets ouverts, d'où le Set. Ce canal ne
// notifie que tant que l'onglet est ouvert — voir sendPushToUser ci-dessous
// pour le relais qui fonctionne même app fermée.
const clients = new Map()

export function registerClient(userId, res) {
  if (!clients.has(userId)) clients.set(userId, new Set())
  clients.get(userId).add(res)
}

export function unregisterClient(userId, res) {
  clients.get(userId)?.delete(res)
  if (clients.get(userId)?.size === 0) clients.delete(userId)
}

function sendToUser(userId, event) {
  const set = clients.get(userId)
  if (!set) return
  const payload = `data: ${JSON.stringify(event)}\n\n`
  for (const res of set) res.write(payload)
}

function pushContent(event) {
  if (event.type === 'demande.created') {
    return {
      title: 'Nouvelle expression de besoin',
      body: `${event.demandeurNom} · ${event.numero} · ${event.programmeNom}`,
      url: '/gestion/demandes',
    }
  }
  if (event.type === 'stock.depleted') {
    return {
      title: 'Rupture de stock',
      body: `${event.designation} n'a plus de stock disponible.`,
      url: '/gestion/alertes',
    }
  }
  return null
}

async function sendPushToUser(userId, event) {
  if (!process.env.VAPID_PUBLIC_KEY) return
  const content = pushContent(event)
  if (!content) return

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } })
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(content)
        )
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Abonnement expiré ou révoqué côté navigateur : on le retire.
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        } else {
          console.error('[push] échec envoi :', err.message)
        }
      }
    })
  )
}

// Notifie tous les gestionnaires actifs qui gèrent ce programme — pas les
// autres, pour rester cohérent avec le cloisonnement par programme déjà en
// place sur le reste de l'API. Canaux :
//   - SSE : immédiat, tant que l'application est ouverte ;
//   - push navigateur : même application fermée (si le gestionnaire l'a accepté) ;
//   - e-mail (optionnel, via `options.email`) : reçu dans tous les cas, même
//     sans navigateur ouvert ni notifications activées.
// Ne lève jamais d'erreur : l'action métier (ex. création de la demande) ne
// doit pas échouer parce qu'une notification n'a pas pu partir.
export async function notifyProgrammeGestionnaires(programmeId, event, options = {}) {
  let membres
  try {
    membres = await prisma.programmeMembre.findMany({
      where: { programmeId, user: { role: 'gestionnaire', actif: true } },
      select: { userId: true, user: { select: { nom: true, email: true } } },
    })
  } catch (err) {
    console.error('[notifications] lecture des gestionnaires impossible :', err.message)
    return
  }

  if (membres.length === 0) {
    console.warn(`[notifications] Aucun gestionnaire actif rattaché au programme ${programmeId} : « ${event.type} » non notifié.`)
    return
  }

  for (const m of membres) {
    sendToUser(m.userId, event)
    sendPushToUser(m.userId, event).catch((err) => console.error('[push] erreur inattendue :', err.message))
    if (options.email && m.user.email) {
      try {
        const { subject, html } = options.email(m.user)
        sendMail({ to: m.user.email, subject, html }).catch((err) => console.error('[mail] erreur inattendue :', err.message))
      } catch (err) {
        console.error('[mail] préparation impossible :', err.message)
      }
    }
  }
}
