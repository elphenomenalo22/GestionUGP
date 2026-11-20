export function compteCreeEmail({ nom, email, tempPassword, url }) {
  return {
    subject: 'Votre compte G-UGP a été créé',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #1d2b45 0%, #2d3f5f 100%);
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .logo {
            color: #f3f1eb;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 2px;
          }
          .logo-icon {
            width: 40px;
            height: 40px;
            vertical-align: middle;
            margin-right: 10px;
          }
          .content {
            background-color: #ffffff;
            padding: 40px 30px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .greeting {
            color: #1d2b45;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px 0;
          }
          .message {
            color: #656e81;
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 25px 0;
          }
          .credentials-box {
            background-color: #f8f9fa;
            border: 1px solid #e1ddd0;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
          }
          .credentials-label {
            color: #656e81;
            font-size: 14px;
            font-weight: 500;
            margin: 0 0 5px 0;
          }
          .credentials-value {
            color: #1d2b45;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 15px 0;
            word-break: break-all;
          }
          .credentials-value:last-child {
            margin-bottom: 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #b8862f 0%, #96691f 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            margin: 25px 0;
            box-shadow: 0 2px 4px rgba(184, 134, 47, 0.3);
          }
          .button:hover {
            background: linear-gradient(135deg, #96691f 0%, #7a5618 100%);
          }
          .footer {
            text-align: center;
            color: #656e81;
            font-size: 14px;
            margin-top: 30px;
            padding: 20px;
          }
          .footer a {
            color: #b8862f;
            text-decoration: none;
          }
          .warning {
            background-color: #fff8e6;
            border-left: 4px solid #b8862f;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning-text {
            color: #1d2b45;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">
              <svg class="logo-icon" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="14" fill="#F3F1EB" fill-opacity="0.2"/>
                <path d="M18 20h16l12 12-16 16-12-12V20z" stroke="#F3F1EB" stroke-width="3.5" stroke-linejoin="round"/>
                <circle cx="24" cy="26" r="2.8" fill="#b8862f"/>
              </svg>
              G-UGP
            </h1>
          </div>
          <div class="content">
            <h2 class="greeting">Bonjour ${nom},</h2>
            <p class="message">
              Votre compte a été créé avec succès sur <strong>G-UGP</strong> (Gestion des stocks et expressions de besoin).
            </p>
            <div class="credentials-box">
              <p class="credentials-label">Adresse e-mail</p>
              <p class="credentials-value">${email}</p>
              <p class="credentials-label">Mot de passe temporaire</p>
              <p class="credentials-value">${tempPassword}</p>
            </div>
            <div class="warning">
              <p class="warning-text">
                ⚠️ <strong>Important :</strong> Vous devrez choisir un nouveau mot de passe dès votre première connexion pour des raisons de sécurité.
              </p>
            </div>
            <a href="${url}" class="button">Se connecter à G-UGP</a>
            <p class="message">
              Si vous n'avez pas demandé la création de ce compte, veuillez contacter votre administrateur.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 G-UGP. Tous droits réservés.</p>
            <p>Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function motDePasseReinitialiseEmail({ nom, tempPassword, url }) {
  return {
    subject: 'Votre mot de passe G-UGP a été réinitialisé',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #1d2b45 0%, #2d3f5f 100%);
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .logo {
            color: #f3f1eb;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 2px;
          }
          .logo-icon {
            width: 40px;
            height: 40px;
            vertical-align: middle;
            margin-right: 10px;
          }
          .content {
            background-color: #ffffff;
            padding: 40px 30px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .greeting {
            color: #1d2b45;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px 0;
          }
          .message {
            color: #656e81;
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 25px 0;
          }
          .credentials-box {
            background-color: #f8f9fa;
            border: 1px solid #e1ddd0;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
          }
          .credentials-label {
            color: #656e81;
            font-size: 14px;
            font-weight: 500;
            margin: 0 0 5px 0;
          }
          .credentials-value {
            color: #1d2b45;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
            word-break: break-all;
            letter-spacing: 1px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #b8862f 0%, #96691f 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            margin: 25px 0;
            box-shadow: 0 2px 4px rgba(184, 134, 47, 0.3);
          }
          .button:hover {
            background: linear-gradient(135deg, #96691f 0%, #7a5618 100%);
          }
          .footer {
            text-align: center;
            color: #656e81;
            font-size: 14px;
            margin-top: 30px;
            padding: 20px;
          }
          .footer a {
            color: #b8862f;
            text-decoration: none;
          }
          .warning {
            background-color: #fff8e6;
            border-left: 4px solid #b8862f;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning-text {
            color: #1d2b45;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
          }
          .info {
            background-color: #e7f2ea;
            border-left: 4px solid #2f7d4f;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-text {
            color: #1d2b45;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">
              <svg class="logo-icon" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="14" fill="#F3F1EB" fill-opacity="0.2"/>
                <path d="M18 20h16l12 12-16 16-12-12V20z" stroke="#F3F1EB" stroke-width="3.5" stroke-linejoin="round"/>
                <circle cx="24" cy="26" r="2.8" fill="#b8862f"/>
              </svg>
              G-UGP
            </h1>
          </div>
          <div class="content">
            <h2 class="greeting">Bonjour ${nom},</h2>
            <p class="message">
              Votre mot de passe a été réinitialisé par un administrateur de <strong>G-UGP</strong>.
            </p>
            <div class="credentials-box">
              <p class="credentials-label">Nouveau mot de passe temporaire</p>
              <p class="credentials-value">${tempPassword}</p>
            </div>
            <div class="warning">
              <p class="warning-text">
                ⚠️ <strong>Important :</strong> Vous devrez choisir un nouveau mot de passe dès votre prochaine connexion pour des raisons de sécurité.
              </p>
            </div>
            <div class="info">
              <p class="info-text">
                💡 <strong>Conseil :</strong> Choisissez un mot de passe fort avec au moins 8 caractères, incluant des majuscules, minuscules, chiffres et caractères spéciaux.
              </p>
            </div>
            <a href="${url}" class="button">Se connecter à G-UGP</a>
            <p class="message">
              Si vous n'avez pas demandé cette réinitialisation, veuillez contacter votre administrateur immédiatement.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 G-UGP. Tous droits réservés.</p>
            <p>Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// E-mail envoyé aux gestionnaires d'un programme dès qu'une nouvelle
// expression de besoin est soumise : le demandeur n'a plus à les prévenir.
// Styles en ligne : de nombreux clients mail ignorent les balises <style>.
export function nouvelleDemandeEmail({ gestionnaireNom, demandeurNom, demandeurPoste, numero, programmeNom, lignes, motif, url }) {
  const rows = lignes
    .map(
      (l) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e6ef;color:#141c33;font-size:14px;">${escapeHtml(l.designation)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e6ef;color:#141c33;font-size:14px;font-weight:600;text-align:right;white-space:nowrap;">${escapeHtml(l.quantite)} ${escapeHtml(l.unite)}</td>
        </tr>`
    )
    .join('')

  const motifBlock = motif
    ? `<div style="margin-top:18px;background:#f4f5f9;border-radius:12px;padding:14px 16px;">
         <p style="margin:0;color:#616b84;font-size:12px;font-weight:600;">Motif</p>
         <p style="margin:4px 0 0;color:#141c33;font-size:14px;line-height:1.5;">${escapeHtml(motif)}</p>
       </div>`
    : ''

  return {
    subject: `Nouvelle expression de besoin ${numero} à traiter`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#141c33;border-radius:16px 16px 0 0;padding:28px 30px;">
      <p style="margin:0;color:#f2c76e;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">G-UGP · Action requise</p>
      <h1 style="margin:10px 0 0;color:#ffffff;font-size:22px;line-height:1.3;">Une nouvelle expression de besoin attend votre décision</h1>
    </div>
    <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:30px;">
      <p style="margin:0 0 18px;color:#616b84;font-size:15px;line-height:1.6;">
        Bonjour ${escapeHtml(gestionnaireNom)},<br>
        <strong style="color:#141c33;">${escapeHtml(demandeurNom)}</strong>${demandeurPoste ? ` (${escapeHtml(demandeurPoste)})` : ''}
        vient de soumettre la demande <strong style="color:#141c33;">${escapeHtml(numero)}</strong>
        sur le programme <strong style="color:#141c33;">${escapeHtml(programmeNom)}</strong>.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e6ef;border-radius:12px;border-collapse:separate;">
        <tr>
          <th align="left" style="padding:10px 14px;background:#f4f5f9;color:#616b84;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Article</th>
          <th align="right" style="padding:10px 14px;background:#f4f5f9;color:#616b84;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Quantité</th>
        </tr>
        ${rows}
      </table>
      ${motifBlock}
      <div style="text-align:center;margin:28px 0 6px;">
        <a href="${url}" style="display:inline-block;background:#b07716;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-size:15px;font-weight:700;">Traiter la demande</a>
      </div>
    </div>
    <p style="text-align:center;color:#616b84;font-size:12px;margin:20px 0 0;">
      Vous recevez cet e-mail car vous êtes gestionnaire de ce programme sur G-UGP.<br>Message automatique, merci de ne pas y répondre.
    </p>
  </div>
</body>
</html>`,
  }
}
