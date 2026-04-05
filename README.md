# mAI Chatbot

<div align="center">

![Chatbot](app/(chat)/opengraph-image.png)

**mAI Chatbot** est un template gratuit et open-source pour construire rapidement des applications de chat intelligentes avec une persistance des données, l'authentification utilisateur et un support multi-modèles IA.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/templates/next.js/chatbot)

[Documentation](#documentation) • [Fonctionnalités](#fonctionnalités) • [Modèles IA](#modèles-ia-supportés) • [Installation](#installation) • [Déploiement](#déploiement)

</div>

---

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Modèles IA Supportés](#modèles-ia-supportés)
- [Système d'abonnement](#système-dabonnement)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Déploiement](#déploiement)
- [Tests](#tests)
- [Structure du projet](#structure-du-projet)
- [API](#api)
- [Base de données](#base-de-données)
- [Contribuer](#contribuer)
- [License](#license)

---

## Aperçu

mAI Chatbot (anciennement AI Chatbot) est construit avec **Next.js 16**, **l'AI SDK v6**, et **PostgreSQL**. Il fournit une base solide pour créer des assistants conversationnels avec :

- 🔄 Gestion complète des conversations avec historique
- 🔐 Authentification sécurisée (Auth.js)
- 💾 Persistance des données (Neon Postgres, Vercel Blob)
- 🤖 Support de 30+ modèles IA via Vercel AI Gateway
- 🎨 Interface moderne avec Tailwind CSS et shadcn/ui
- 📊 Système d'abonnement avec quotas personnalisés

---

## Fonctionnalités

### Core

| Fonctionnalité | Description |
|---------------|-------------|
| **Next.js 16 App Router** | Routage avancé, Server Components (RSC), Server Actions |
| **AI SDK v6** | API unifiée pour texte, objets structurés et appels d'outils |
| **Multi-modèles** | OpenAI, Anthropic, Google, Mistral, xAI, DeepSeek, Moonshot, etc. |
| **shadcn/ui** | Composants accessibles basés sur Radix UI + Tailwind CSS |

### Persistance & Stockage

| Service | Usage |
|---------|-------|
| **Neon Serverless Postgres** | Historique des chats, utilisateurs, messages |
| **Vercel Blob** | Stockage de fichiers (images, documents) |
| **Redis** | Rate limiting, cache, sessions |

### Authentification

- **Auth.js** : Authentication simple et sécurisée
- Support des comptes invités (guest)
- Gestion des rôles et permissions

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 16 App                         │
├─────────────────────────────────────────────────────────────┤
│  App Routes                                                 │
│  ├── /(chat)        → Interface principale de chat          │
│  ├── /(auth)        → Login/Register/Auth                   │
│  └── /api           → API REST endpoints                    │
├─────────────────────────────────────────────────────────────┤
│  AI SDK v6                                                  │
│  ├── Vercel AI Gateway (unified provider)                  │
│  ├── Direct providers (OpenAI, Mistral, etc.)              │
│  └── Ollama (local models)                                 │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├── Drizzle ORM → PostgreSQL (Neon)                       │
│  ├── Vercel Blob → File storage                            │
│  └── Redis → Rate limiting & cache                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Modèles IA Supportés

### Via Vercel AI Gateway

| Modèle | Provider | Cas d'usage |
|--------|----------|-------------|
| DeepSeek V3.2 | DeepSeek | Tâches générales avec outils |
| Mistral Codestral | Mistral | Code, débogage, développement |
| Mistral Small | Mistral | Vision, rapidité, qualité |
| Kimi K2 0905 | Moonshot | Conversations longues |
| Kimi K2.5 | Moonshot | Cas complexes premium |
| GPT OSS 20B/120B | OpenAI | Raisonnement léger à avancé |
| Grok 4.1 Fast | xAI | Réponses conversationnelles rapides |

### Via CometAPI & Google

| Modèle | Provider | Cas d'usage |
|--------|----------|-------------|
| GPT-5.4 Nano/Mini | CometAPI | Tâches simples à équilibrées |
| Gemini 2.5 Flash/Lite | Google | Production, coût/performance |
| Gemini 2.0 Flash Lite | Google | Prototypage rapide |

### Low-Cost (Cerebras & Mistral API)

| Modèle | Provider | Cas d'usage |
|--------|----------|-------------|
| Llama 3.1 8B | Cerebras | Traitements volumineux |
| Qwen 3 32B | Cerebras | Raisonnement maîtrisé |
| Ministral 3B/8B | Mistral | Budget contraint, production |

### OpenRouter (Gratuits & Premium)

| Modèle | Type | Cas d'usage |
|--------|------|-------------|
| Step 1 Flash, LFM 40B, GLM-4 9B | Free | Tests, expérimentations |
| Llama 3.3 70B, Nemotron 70B | Low-cost | Performance générale |
| Claude 3.5 Haiku, GPT-4o Mini | Premium | Qualité professionnelle |

### Local (Ollama)

| Modèle | Usage |
|--------|-------|
| Llama 3.1, Gemma 2 9B | Confidentialité, autonomie |
| Mistral Nemo, Phi 3.5 | Ressources limitées |
| DeepSeek Coder V2 | Code en local |

> **Voir [docs/models.md](/docs/models.md)** pour la configuration détaillée des modèles.

---

## Système d'abonnement

mAI inclut un système de quotas par abonnement :

| Plan | Fichiers/jour | Taille max | Messages/heure | Coder Credits | Santé/mois |
|------|---------------|------------|----------------|---------------|------------|
| **Free** | 3 | 10 MB | 10 | 30 | 5 |
| **Plus (mAI+)** | 10 | 50 MB | 30 | 50 | 10 |
| **Pro (mAI Pro)** ⭐ | 20 | 100 MB | 50 | 75 | 15 |
| **Max (mAI Max)** | 50 | 200 MB | 200 | 150 | 25 |

**Codes d'activation** : `MAI_PLUS`, `MAI_PRO`, `MAI_MAX` (validation serveur)

> **Voir [docs/subscription.md](/docs/subscription.md)** pour les détails du système d'abonnement.

---

## Installation

### Prérequis

- Node.js 20+ 
- pnpm 10+ (`npm install -g pnpm`)
- Compte Vercel (optionnel pour le développement local)

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/votre-org/chatbot.git
cd chatbot
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

4. **Générer la base de données**
```bash
pnpm db:generate
pnpm db:migrate
```

5. **Lancer le serveur de développement**
```bash
pnpm dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

---

## Configuration

### Variables d'environnement requises

| Variable | Description | Source |
|----------|-------------|--------|
| `AUTH_SECRET` | Secret pour Auth.js | `openssl rand -base64 32` |
| `AI_GATEWAY_API_KEY` | Clé API Vercel AI Gateway | [Vercel AI Gateway](https://vercel.com/ai-gateway) |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob | [Vercel Storage](https://vercel.com/docs/storage) |
| `POSTGRES_URL` | URL de connexion PostgreSQL | [Neon](https://neon.tech) ou [Vercel Postgres](https://vercel.com/postgres) |
| `REDIS_URL` | URL Redis | [Vercel Redis](https://vercel.com/docs/storage/redis) |
| `MAI_PLUS`, `MAI_PRO`, `MAI_MAX` | Codes d'activation premium | Générés par l'administrateur |

### Variables optionnelles

| Variable | Description |
|----------|-------------|
| `CEREBRAS_API_KEY` | Clé API Cerebras (low-cost) |
| `MISTRAL_API_KEY` | Clé API Mistral (low-cost) |
| `CEREBRAS_API_BASE_URL` | Endpoint custom Cerebras |
| `MISTRAL_API_BASE_URL` | Endpoint custom Mistral |

> **Voir [docs/configuration.md](/docs/configuration.md)** pour le guide complet de configuration.

---

## Développement

### Scripts disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Démarrer le serveur de développement (turbo mode) |
| `pnpm build` | Construire pour la production + migrations DB |
| `pnpm start` | Démarrer le serveur de production |
| `pnpm check` | Vérifier le code avec Ultracite |
| `pnpm fix` | Corriger automatiquement les problèmes de style |
| `pnpm db:generate` | Générer les migrations Drizzle |
| `pnpm db:migrate` | Appliquer les migrations |
| `pnpm db:studio` | Ouvrir Drizzle Studio (GUI DB) |
| `pnpm db:push` | Pousser le schema vers la DB |
| `pnpm db:pull` | Tirer le schema depuis la DB |
| `pnpm test` | Exécuter les tests Playwright |

### Linting & Format

Le projet utilise **Biome** et **Ultracite** pour le linting :

```bash
pnpm check   # Vérifier les problèmes
pnpm fix     # Corriger automatiquement
```

---

## Déploiement

### Vercel (Recommandé)

1. Cliquez sur **"Deploy with Vercel"** ci-dessus
2. Connectez votre compte GitHub
3. Configurez les variables d'environnement dans le dashboard Vercel
4. Déployez !

**Note** : Pour les déploiements Vercel, l'authentification AI Gateway est gérée automatiquement via OIDC.

### Déploiement manuel

```bash
# Build avec migrations
pnpm build

# Démarrer
pnpm start
```

### Variables d'environnement en production

Assurez-vous de définir toutes les variables requises dans votre plateforme d'hébergement :

- Vercel : Dashboard → Project Settings → Environment Variables
- Autre : Utilisez un fichier `.env` ou les variables système

> **Voir [docs/deployment.md](/docs/deployment.md)** pour les guides de déploiement détaillés.

---

## Tests

Le projet inclut des tests end-to-end avec **Playwright** :

```bash
# Exécuter tous les tests
pnpm test

# Tests spécifiques
pnpm test tests/e2e/chat.test.ts
pnpm test tests/e2e/auth.test.ts
```

### Structure des tests

```
tests/
├── e2e/
│   ├── chat.test.ts      # Tests de conversation
│   ├── auth.test.ts      # Tests d'authentification
│   ├── api.test.ts       # Tests d'API
│   └── model-selector.test.ts  # Tests de sélection de modèle
├── pages/                # Page objects
├── fixtures.ts           # Fixtures de test
└── helpers.ts            # Helpers utilitaires
```

> **Voir [docs/testing.md](/docs/testing.md)** pour écrire et exécuter des tests.

---

## Structure du projet

```
chatbot/
├── app/                      # Next.js App Router
│   ├── (chat)/               # Routes principales de chat
│   │   ├── chat/[id]/        # Pages de conversation
│   │   ├── library/          # Bibliothèque de documents
│   │   ├── projects/         # Gestion de projets
│   │   ├── settings/         # Paramètres utilisateur
│   │   ├── studio/           # Mode studio
│   │   ├── news/             # Recherche d'actualités
│   │   ├── Health/           # Module santé
│   │   └── api/              # API internes au chat
│   ├── (auth)/               # Authentification
│   │   ├── login/            # Connexion
│   │   ├── register/         # Inscription
│   │   └── api/auth/         # Endpoints Auth.js
│   ├── api/                  # API publiques
│   │   ├── agents/           # Gestion des agents IA
│   │   ├── projects/         # CRUD projets
│   │   ├── subscription/     # Gestion abonnements
│   │   ├── coder/            # Assistant codeur
│   │   ├── export/           # Export de données
│   │   └── news/             # Recherche news
│   └── layout.tsx            # Layout racine
├── artifacts/                # Types de documents générés
│   ├── text/                 # Documents texte
│   ├── code/                 # Snippets de code
│   ├── sheet/                # Feuilles de calcul
│   └── image/                # Images générées
├── components/               # Composants React
│   ├── chat/                 # Composants de chat
│   ├── ui/                   # Composants UI de base
│   └── ai-elements/          # Éléments IA
├── hooks/                    # Custom React Hooks
│   ├── use-active-chat.tsx   # Gestion du chat actif
│   ├── use-subscription-plan.ts  # État de l'abonnement
│   └── use-mobile.ts         # Détection mobile
├── lib/                      # Utilitaires et logique métier
│   ├── ai/                   # Configuration IA
│   │   └── models.ts         # Liste des modèles
│   ├── db/                   # Base de données
│   │   ├── schema.ts         # Schéma Drizzle
│   │   ├── queries.ts        # Requêtes
│   │   └── migrations/       # Migrations
│   ├── subscription.ts       # Logique d'abonnement
│   ├── ratelimit.ts          # Rate limiting
│   └── utils.ts              # Utilitaires
├── tests/                    # Tests Playwright
├── public/                   # Assets statiques
├── docs/                     # Documentation
└── package.json
```

> **Voir [docs/architecture.md](/docs/architecture.md)** pour une vue détaillée de l'architecture.

---

## API

### Endpoints principaux

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/chat` | POST | Envoyer un message et recevoir une réponse |
| `/api/chat/[id]` | GET | Récupérer une conversation |
| `/api/history` | GET | Historique des conversations |
| `/api/vote` | POST | Voter pour/un message |
| `/api/files/upload` | POST | Uploader un fichier |
| `/api/agents` | GET/POST | Lister/créer des agents |
| `/api/projects` | GET/POST | Lister/créer des projets |
| `/api/subscription/activate` | POST | Activer un code premium |
| `/api/news/search` | GET | Rechercher des actualités |
| `/api/export` | POST | Exporter les données utilisateur |

> **Voir [docs/api.md](/docs/api.md)** pour la documentation complète de l'API.

---

## Base de données

### Schéma principal

Le projet utilise **Drizzle ORM** avec PostgreSQL :

- **User** : Utilisateurs (auth, profil, statut)
- **Chat** : Conversations (titre, visibilité, liens agent/projet)
- **Message_v2** : Messages (rôle, contenu, pièces jointes)
- **Vote_v2** : Votes sur les messages
- **Document** : Documents générés (texte, code, image, sheet)
- **Suggestion** : Suggestions d'édition
- **Agent** : Agents IA personnalisés
- **Project** : Projets utilisateur
- **Subscription** : Abonnements premium

> **Voir [docs/database.md](/docs/database.md)** pour le schéma complet et les migrations.

---

## Contribuer

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Forker le repository
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Committer vos changements (`git commit -m 'Add amazing feature'`)
4. Pusher (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Guidelines

- Suivre le style de code existant (Biome/Ultracite)
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation si nécessaire

---

## License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## Liens utiles

- 📘 [Documentation complète](/docs/)
- 🤖 [Guide des modèles IA](/docs/models.md)
- 🔧 [Configuration](/docs/configuration.md)
- 🏗️ [Architecture](/docs/architecture.md)
- 📊 [Base de données](/docs/database.md)
- 🌐 [API Reference](/docs/api.md)
- 💳 [Système d'abonnement](/docs/subscription.md)
- 🚀 [Déploiement](/docs/deployment.md)
- ✅ [Tests](/docs/testing.md)

---

<p align="center">
  Construit avec ❤️ en utilisant Next.js, AI SDK et Vercel
</p>
