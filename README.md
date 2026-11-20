# G-UGP — Gestion des stocks et expressions de besoins

Application de suivi du stock et des expressions de besoin, organisée par programme.

| Dossier | Contenu | Hébergement |
|---|---|---|
| [`api/`](api/) | API Node.js / Express + Prisma (PostgreSQL) | Render |
| [`gugp-front/`](gugp-front/) | Frontend React + Vite (PWA) | Vercel |

## Rôles

- **Utilisateur** : consulte le catalogue et soumet des expressions de besoin.
- **Gestionnaire** : gère le stock, approuve ou rejette les demandes (un bon est généré à l'approbation).
- **Administrateur** : gère les comptes et les programmes.

## Notification automatique des nouvelles demandes

Le demandeur n'a pas besoin de prévenir le gestionnaire. Dès qu'une expression de besoin est soumise, chaque gestionnaire **actif rattaché au programme** est prévenu automatiquement :

1. **Dans l'application** : alerte visuelle et sonore, listes et compteurs mis à jour sans recharger la page, nombre de demandes en attente dans la barre du haut et dans le titre de l'onglet.
2. **Notification du navigateur** : reçue même application fermée, si le gestionnaire l'a autorisée (invite proposée à la connexion).
3. **E-mail** : récapitulatif de la demande avec un bouton « Traiter la demande ». Nécessite `BREVO_API_KEY` sur Render.

> Un programme sans gestionnaire rattaché ne déclenche aucune notification : vérifiez dans **Admin → Programmes → Membres** que chaque programme a au moins un gestionnaire.

## Développement local

```bash
# API (nécessite une base PostgreSQL, voir api/.env.example)
cd api && npm install && cp .env.example .env && npx prisma migrate deploy && npm run dev

# Frontend
cd gugp-front && npm install && cp .env.example .env && npm run dev
```

## Déploiement

Voir [gugp-front/DEPLOIEMENT-VERCEL-RENDER.md](gugp-front/DEPLOIEMENT-VERCEL-RENDER.md) (Render pour l'API, Vercel pour le frontend).
