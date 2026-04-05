# Architecture

Ce document décrit l'architecture technique de mAI Chatbot, l'organisation du code et les flux de données.

## 📋 Sommaire

- [Vue d'ensemble](#vue-densemble)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Flux de données](#flux-de-données)
- [Composants clés](#composants-clés)
- [Patterns de conception](#patterns-de-conception)

---

## Vue d'ensemble

mAI Chatbot est une application web moderne construite avec **Next.js 16** en architecture App Router, exploitant les **React Server Components (RSC)** et les **Server Actions** pour des performances optimales.

### Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React 19 + RSC                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │   Pages     │  │  Composants │  │      Hooks      │  │  │
│  │  │   (chat,    │  │    UI +     │  │  (use-active-   │  │  │
│  │  │   auth)     │  │  Features   │  │   chat, etc.)   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Application                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   App Router Layer                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │  │
│  │  │  /(chat)     │  │  /(auth)     │  │  /api         │  │  │
│  │  │  - chat/[id] │  │  - login     │  │  - agents     │  │  │
│  │  │  - library   │  │  - register  │  │  - projects   │  │  │
│  │  │  - settings  │  │  - api/auth  │  │  - subscription│  │  │
│  │  │  - studio    │  │              │  │  - coder      │  │  │
│  │  │  - news      │  │              │  │  - export     │  │  │
│  │  │  - Health    │  │              │  │  - news       │  │  │
│  │  └──────────────┘  └──────────────┘  └───────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Business Logic Layer                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │ AI SDK v6   │  │ Subscription│  │   Rate Limiting │  │  │
│  │  │ - Gateway   │  │ - Plans     │  │   - Redis       │  │  │
│  │  │ - Providers │  │ - Quotas    │  │   - Limits      │  │  │
│  │  │ - Models    │  │ - Validation│  │                 │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Data Access Layer                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │ Drizzle ORM │  │   Queries   │  │    Migrations   │  │  │
│  │  │ - Schema    │  │  - Users    │  │  - Versioned    │  │  │
│  │  │ - Types     │  │  - Chats    │  │  - Auto-generate│  │  │
│  │  │             │  │  - Messages │  │                 │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Neon Postgres│  │ Vercel Blob  │ │  Upstash Redis│         │
│  │  - Users     │  │  - Files     │ │  - Cache      │         │
│  │  - Chats     │  │  - Images    │ │  - Sessions   │         │
│  │  - Messages  │  │  - Documents │ │  - Rate limit │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────────────────────────────────────────────┐      │
│  │           Vercel AI Gateway + Providers              │      │
│  │  OpenAI • Anthropic • Google • Mistral • xAI • etc. │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack technique

### Core

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 16.2.0 | Framework React full-stack |
| **React** | 19.0.1 | Bibliothèque UI |
| **TypeScript** | 5.6.3 | Typage statique |
| **Tailwind CSS** | 4.1.13 | Styling |

### AI & LLM

| Technologie | Version | Usage |
|-------------|---------|-------|
| **AI SDK** | 6.0.116 | Interface unifiée pour LLMs |
| **Vercel AI Gateway** | - | Routing multi-providers |
| **Providers** | - | OpenAI, Mistral, Google, xAI, etc. |

### Base de données

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Drizzle ORM** | 0.34.0 | ORM type-safe |
| **PostgreSQL** | 15+ | Base de données principale |
| **Neon** | - | PostgreSQL serverless |

### Authentification

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Auth.js** | 5.0.0-beta.25 | Authentication |
| **bcrypt-ts** | 5.0.2 | Hashage de mots de passe |

### Stockage & Cache

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Vercel Blob** | 0.24.1 | Stockage de fichiers |
| **Redis** | 5.0.0 | Cache et rate limiting |
| **Upstash** | - | Redis serverless |

### UI & UX

| Technologie | Version | Usage |
|-------------|---------|-------|
| **shadcn/ui** | - | Composants UI |
| **Radix UI** | 1.4.3 | Primitives accessibles |
| **Framer Motion** | 11.3.19 | Animations |
| **Lucide React** | 0.446.0 | Icônes |

### Qualité de code

| Outil | Usage |
|-------|-------|
| **Biome** | Linting et formatting |
| **Ultracite** | Quality checks |
| **Playwright** | Tests E2E |

---

## Structure du projet

```
chatbot/
├── app/                          # Next.js App Router
│   ├── (chat)/                   # Routes principales (layout partagé)
│   │   ├── chat/[id]/            # Pages de conversation individuelles
│   │   │   ├── page.tsx          # Component page
│   │   │   └── loading.tsx       # Loading UI
│   │   ├── library/              # Bibliothèque de documents
│   │   ├── projects/             # Gestion de projets
│   │   ├── settings/             # Paramètres utilisateur
│   │   ├── studio/               # Mode studio (création avancée)
│   │   ├── news/                 # Recherche d'actualités
│   │   ├── Health/               # Module santé
│   │   ├── pricing/              # Page tarifs
│   │   ├── mais/                 # Fonctionnalités mAI
│   │   ├── translation/          # Traduction
│   │   ├── coder/                # Assistant codeur
│   │   ├── layout.tsx            # Layout partagé du chat
│   │   ├── page.tsx              # Page d'accueil du chat
│   │   ├── actions.ts            # Server Actions du chat
│   │   └── api/                  # API routes internes
│   │       ├── chat/             # Endpoints chat
│   │       ├── suggestions/      # Suggestions IA
│   │       ├── document/         # Gestion documents
│   │       ├── models/           # Liste des modèles
│   │       ├── vote/             # Votes messages
│   │       ├── files/upload/     # Upload fichiers
│   │       └── history/          # Historique conversations
│   │
│   ├── (auth)/                   # Routes d'authentification
│   │   ├── login/                # Page de connexion
│   │   ├── register/             # Page d'inscription
│   │   ├── layout.tsx            # Layout auth
│   │   ├── actions.ts            # Server Actions auth
│   │   ├── auth.ts               # Configuration Auth.js
│   │   ├── auth.config.ts        # Config options
│   │   └── api/auth/             # Endpoints Auth.js
│   │       └── [...nextauth]/
│   │           └── route.ts
│   │
│   ├── api/                      # API publiques
│   │   ├── agents/               # CRUD Agents IA
│   │   ├── projects/             # CRUD Projets
│   │   ├── subscription/         # Gestion abonnements
│   │   ├── coder/                # API codeur
│   │   ├── export/               # Export données
│   │   ├── news/                 # Recherche news
│   │   └── studio/               # API studio
│   │
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Styles globaux
│
├── artifacts/                    # Types de documents générés
│   ├── text/                     # Documents texte
│   │   ├── client.tsx
│   │   └── server.ts
│   ├── code/                     # Snippets de code
│   │   ├── client.tsx
│   │   └── server.ts
│   ├── sheet/                    # Feuilles de calcul
│   │   ├── client.tsx
│   │   └── server.ts
│   ├── image/                    # Images générées
│   └── actions.ts                # Actions partagées
│
├── components/                   # Composants React
│   ├── chat/                     # Composants spécifiques au chat
│   │   ├── message.tsx
│   │   ├── chat-input.tsx
│   │   ├── model-selector.tsx
│   │   └── ...
│   ├── ui/                       # Composants UI de base (shadcn)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ...
│   └── ai-elements/              # Éléments IA spéciaux
│
├── hooks/                        # Custom React Hooks
│   ├── use-active-chat.tsx       # État du chat actif
│   ├── use-subscription-plan.ts  # État de l'abonnement
│   ├── use-mobile.ts             # Détection mobile
│   ├── use-artifact.ts           # Gestion des artifacts
│   ├── use-chat-visibility.ts    # Visibilité des chats
│   └── use-auto-resume.ts        # Reprise automatique
│
├── lib/                          # Utilitaires et logique métier
│   ├── ai/                       # Configuration IA
│   │   ├── models.ts             # Liste et config des modèles
│   │   └── providers/            # Providers personnalisés
│   ├── db/                       # Couche données
│   │   ├── schema.ts             # Schéma Drizzle
│   │   ├── queries.ts            # Requêtes typées
│   │   ├── utils.ts              # Utilitaires DB
│   │   └── migrations/           # Migrations versionnées
│   ├── editor/                   # Logique éditeur
│   ├── artifacts/                # Utils pour artifacts
│   ├── subscription.ts           # Logique d'abonnement
│   ├── ratelimit.ts              # Rate limiting
│   ├── usage-limits.ts           # Calcul des limites
│   ├── constants.ts              # Constantes applicatives
│   ├── types.ts                  # Types TypeScript partagés
│   ├── errors.ts                 # Classes d'erreur
│   └── utils.ts                  # Fonctions utilitaires
│
├── tests/                        # Tests Playwright
│   ├── e2e/                      # Tests end-to-end
│   │   ├── chat.test.ts
│   │   ├── auth.test.ts
│   │   ├── api.test.ts
│   │   └── model-selector.test.ts
│   ├── pages/                    # Page objects
│   ├── fixtures.ts               # Fixtures de test
│   └── helpers.ts                # Helpers de test
│
├── public/                       # Assets statiques
│   ├── images/
│   └── fonts/
│
├── docs/                         # Documentation
│   ├── README.md
│   ├── configuration.md
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── models.md
│   ├── subscription.md
│   ├── deployment.md
│   └── testing.md
│
├── instrumentation.ts            # Instrumentation OpenTelemetry
├── instrumentation-client.ts     # Instrumentation client
├── next.config.ts                # Configuration Next.js
├── drizzle.config.ts             # Configuration Drizzle
├── playwright.config.ts          # Configuration Playwright
├── tailwind.config.ts            # Configuration Tailwind
├── tsconfig.json                 # Configuration TypeScript
├── package.json                  # Dépendances et scripts
└── README.md                     # Documentation principale
```

---

## Flux de données

### 1. Flux de conversation (Chat Flow)

```
Utilisateur
    │
    ▼
┌─────────────────┐
│  Saisie message │
│  (ChatInput)    │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  useActiveChat  │ ◄── Hook React
│  sendMessage()  │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Server Action  │
│  sendMessage()  │
└─────────────────┘
    │
    ├──────────────────────┐
    ▼                      ▼
┌─────────────┐      ┌─────────────┐
│ Sauvegarde  │      │  Stream IA  │
│ Message     │      │  (AI SDK)   │
│ User        │      │             │
└─────────────┘      └─────────────┘
    │                      │
    │                      ▼
    │              ┌─────────────┐
    │              │ Vercel AI   │
    │              │ Gateway     │
    │              └─────────────┘
    │                      │
    │                      ▼
    │              ┌─────────────┐
    │              │ Provider    │
    │              │ (OpenAI,    │
    │              │  Mistral..) │
    │              └─────────────┘
    │                      │
    ▼                      ▼
┌─────────────────────────────┐
│  Affichage en temps réel    │
│  (streamToResponse)         │
└─────────────────────────────┘
    │
    ▼
┌─────────────┐
│ Sauvegarde  │
│ Réponse     │
│ + Votes     │
└─────────────┘
```

### 2. Flux d'authentification

```
┌─────────────┐
│  Login Form │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Server      │
│ Action      │
│ signIn()    │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Auth.js     │
│ Callback    │
└─────────────┘
    │
    ├──────────────┐
    ▼              ▼
┌─────────┐   ┌─────────┐
│ Credentials│  │ OAuth  │
│ (Email/   │  │ Provider│
│  Password)│  │         │
└─────────┘   └─────────┘
    │              │
    ▼              ▼
┌─────────────────┐
│ Session JWT     │
│ + Cookie HttpOnly│
└─────────────────┘
    │
    ▼
┌─────────────┐
│ Redirect    │
│ vers /chat  │
└─────────────┘
```

### 3. Flux de quota (Subscription Check)

```
Action Utilisateur
(Upload, Message, etc.)
    │
    ▼
┌─────────────┐
│ useSubscript│
│ ionPlan()   │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Vérification│
│ côté client │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Server      │
│ Action      │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Vérification│
│ côté serveur│
│ (DB + Redis)│
└─────────────┘
    │
    ├─────────────┐
    ▼             ▼
┌─────────┐   ┌─────────┐
│ Quota OK│   │ Quota   │
│ → Exec  │   │ dépassé │
└─────────┘   └─────────┘
                  │
                  ▼
            ┌─────────────┐
            │ Erreur 429  │
            │ + Upgrade   │
            │ suggestion  │
            └─────────────┘
```

---

## Composants clés

### AI SDK Integration

Le cœur de l'application utilise l'AI SDK v6 :

```typescript
// lib/ai/providers.ts
import { createAzure } from '@ai-sdk/azure';
import { createOpenAI } from '@ai-sdk/openai';
import { createMistral } from '@ai-sdk/mistral';

// Via AI Gateway (recommandé)
const gateway = createAIProvider({
  baseURL: 'https://ai-gateway.vercel.sh/v1',
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

// Modèle par défaut
export const DEFAULT_MODEL = gateway.languageModel('moonshotai/kimi-k2-0905');
```

### Drizzle ORM Schema

```typescript
// lib/db/schema.ts
export const user = pgTable("User", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  name: text("name"),
  // ...
});

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId").references(() => user.id),
  // ...
});
```

### Server Actions

```typescript
// app/(chat)/actions.ts
'use server';

import { generateText } from 'ai';
import { getChat, saveMessage } from '@/lib/db/queries';

export async function sendMessage(formData: FormData) {
  const message = formData.get('message') as string;
  const chatId = formData.get('chatId') as string;
  
  // Sauvegarder le message utilisateur
  await saveMessage({
    chatId,
    role: 'user',
    content: message,
  });
  
  // Générer la réponse IA
  const response = await generateText({
    model: DEFAULT_MODEL,
    messages: [{ role: 'user', content: message }],
  });
  
  // Sauvegarder la réponse
  await saveMessage({
    chatId,
    role: 'assistant',
    content: response.text,
  });
  
  return response.text;
}
```

---

## Patterns de conception

### 1. Route Groups

Les groupes de routes `(chat)` et `(auth)` permettent d'avoir des layouts différents :

```
app/
├── (chat)/layout.tsx    # Layout avec sidebar, header chat
├── (auth)/layout.tsx    # Layout minimal centré
└── api/                 # Pas de layout (API routes)
```

### 2. Server Components by Default

Tous les composants sont des Server Components par défaut. Seul le code interactif est marqué `'use client'` :

```tsx
// Server Component (défaut)
export default async function ChatPage({ params }: Props) {
  const chat = await getChat(params.id);
  return <ChatMessages messages={chat.messages} />;
}

// Client Component (opt-in)
'use client';

export function ChatInput({ onSend }: Props) {
  const [input, setInput] = useState('');
  return <form onSubmit={() => onSend(input)}>...</form>;
}
```

### 3. Streaming Responses

L'AI SDK permet de streamer les réponses en temps réel :

```typescript
// app/(chat)/api/chat/route.ts
export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = await streamText({
    model: DEFAULT_MODEL,
    messages,
  });
  
  return result.toDataStreamResponse();
}
```

### 4. Optimistic Updates

Les mises à jour optimistes améliorent la réactivité :

```tsx
function useSendMessage() {
  const [messages, setMessages] = useState([]);
  
  const sendOptimistic = async (content: string) => {
    // Ajout optimiste immédiat
    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, content, pending: true }]);
    
    try {
      // Envoi réel
      await sendMessageAction(content);
    } catch {
      // Rollback en cas d'erreur
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };
}
```

### 5. Edge Runtime

Les API routes critiques tournent sur Edge Runtime pour une latence minimale :

```typescript
// app/(chat)/api/chat/route.ts
export const runtime = 'edge';

export async function POST(req: Request) {
  // Code exécuté sur le Edge
}
```

---

## Performance

### Optimisations implémentées

1. **React Server Components** : Réduction du bundle JS client
2. **Streaming** : Affichage progressif des réponses
3. **Edge Functions** : Exécution proche de l'utilisateur
4. **Cache Redis** : Réduction des requêtes DB
5. **Index DB** : Requêtes optimisées sur PostgreSQL
6. **Lazy Loading** : Chargement différé des composants lourds

### Bundle size

- **Client** : ~150KB (gzipped)
- **Server** : ~500KB
- **Chunks dynamiques** : Par feature

---

## Sécurité

### Mesures implémentées

1. **Auth.js** : Sessions sécurisées avec JWT
2. **HttpOnly Cookies** : Protection XSS
3. **CSRF Protection** : Tokens automatiques
4. **Rate Limiting** : Prévention abuse (Redis)
5. **Input Validation** : Zod schemas
6. **SQL Injection** : Drizzle ORM parameterized queries
7. **Environment Variables** : Secrets non-committés

---

## Ressources supplémentaires

- [Configuration](configuration.md) - Setup environnement
- [Base de données](database.md) - Schéma et migrations
- [API](api.md) - Référence complète des endpoints
- [Déploiement](deployment.md) - Guide de mise en production

---

<p align="center">
  <a href="/docs/README.md">← Retour à la documentation</a> • 
  <a href="/docs/database.md">Base de données →</a>
</p>
