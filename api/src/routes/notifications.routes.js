import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../db.js'
import { requireAuth, requireRole, requirePasswordChanged } from '../middleware/auth.js'
import { registerClient, unregisterClient } from '../lib/notifications.js'

const router = Router()

// EventSource ne permet pas d'en-tête Authorization personnalisé : le jeton
// passe donc en paramètre de requête pour cette route uniquement, avec sa
// propre vérification (les autres routes utilisent le middleware requireAuth
// standard, basé sur l'en-tête).
router.get('/stream', async (req, res) => {
  const token = req.query.token
  if (!token) return res.status(401).end()

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).end()
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user || !user.actif || user.mustChangePassword) return res.status(401).end()
  if (user.role !== 'gestionnaire') return res.status(403).end()

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  res.write('retry: 3000\n\n')

  registerClient(user.id, res)

  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000)

  req.on('close', () => {
    clearInterval(heartbeat)
    unregisterClient(user.id, res)
  })
})

router.post('/subscribe', requireAuth, requirePasswordChanged, requireRole('gestionnaire'), async (req, res) => {
  const { endpoint, keys } = req.body?.subscription || req.body || {}
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: 'Abonnement push invalide.' })
  }
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: req.user.id, p256dh: keys.p256dh, auth: keys.auth },
    create: { userId: req.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
  })
  res.status(201).json({ ok: true })
})

router.delete('/subscribe', requireAuth, requirePasswordChanged, requireRole('gestionnaire'), async (req, res) => {
  const { endpoint } = req.body || {}
  if (!endpoint) return res.status(400).json({ message: 'endpoint requis.' })
  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: req.user.id } })
  res.json({ ok: true })
})

export default router
