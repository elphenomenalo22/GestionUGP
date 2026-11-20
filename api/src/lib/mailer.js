import nodemailer from 'nodemailer'

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  APP_URL,
  BREVO_API_KEY,
  RESEND_API_KEY,
} = process.env

// Clé API Brevo explicite ou transmise dans SMTP_PASS
const effectiveBrevoApiKey =
  BREVO_API_KEY || (SMTP_PASS && SMTP_PASS.startsWith('xkeysib-') ? SMTP_PASS : null)

const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
  : null

export function appUrl(path = '/') {
  return `${(APP_URL || 'http://localhost:5173').replace(/\/+$/, '')}${path}`
}

export function loginUrl() {
  return appUrl('/connexion')
}

function parseSender(fromStr) {
  if (!fromStr) return { email: 'no-reply@ugp-boad.tg', name: 'G-UGP' }
  const match = fromStr.match(/^(.*?)\s*<(.+?)>$/)
  if (match) {
    const name = match[1].replace(/["']/g, '').trim()
    const email = match[2].trim()
    return name ? { name, email } : { email }
  }
  return { email: fromStr.trim() }
}

async function sendViaBrevoApi({ to, subject, html }) {
  const sender = parseSender(SMTP_FROM || SMTP_USER)
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': effectiveBrevoApiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Brevo API (${response.status}): ${errorText}`)
  }
  return true
}

async function sendViaResendApi({ to, subject, html }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: SMTP_FROM || 'G-UGP <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Resend API (${response.status}): ${errorText}`)
  }
  return true
}

// Renvoie true si l'e-mail a réellement été envoyé. Si aucun fournisseur
// n'est configuré (ex. développement local), l'appelant doit prévoir un
// repli — ne jamais faire échouer l'action métier pour autant.
export async function sendMail({ to, subject, html }) {
  // 1. Priorité aux APIs HTTP (recommandé sur Render Free où les ports SMTP 25, 465, 587 sont bloqués)
  if (effectiveBrevoApiKey) {
    try {
      await sendViaBrevoApi({ to, subject, html })
      return true
    } catch (err) {
      console.error(`[mailer] Échec Brevo API pour ${to} :`, err.message)
      return false
    }
  }

  if (RESEND_API_KEY) {
    try {
      await sendViaResendApi({ to, subject, html })
      return true
    } catch (err) {
      console.error(`[mailer] Échec Resend API pour ${to} :`, err.message)
      return false
    }
  }

  // 2. Relais SMTP classique (Nodemailer)
  if (!transporter) {
    console.warn(
      `[mailer] Aucun service mail configuré (ni API Brevo/Resend, ni SMTP) — e-mail non envoyé à ${to} ("${subject}").`
    )
    return false
  }

  try {
    await transporter.sendMail({ from: SMTP_FROM || SMTP_USER, to, subject, html })
    return true
  } catch (err) {
    console.error(`[mailer] Échec de l'envoi à ${to} :`, err.message)
    if (err.message?.includes('timeout') || err.code === 'ETIMEDOUT') {
      console.error(
        `[mailer] Note Render : le plan gratuit de Render bloque les ports SMTP (25, 465, 587). Utilisez BREVO_API_KEY ou RESEND_API_KEY (via HTTPS 443) dans les variables d'environnement de Render.`
      )
    }
    return false
  }
}
