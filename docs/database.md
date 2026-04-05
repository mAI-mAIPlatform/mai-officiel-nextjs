# Base de données

Documentation complète du schéma de base de données, des migrations et des requêtes.

## 📋 Sommaire

- [Vue d'ensemble](#vue-densemble)
- [Schéma de la base de données](#schéma-de-la-base-de-données)
- [Tables détaillées](#tables-détaillées)
- [Migrations](#migrations)
- [Requêtes courantes](#requêtes-courantes)
- [Optimisation](#optimisation)

---

## Vue d'ensemble

mAI Chatbot utilise **PostgreSQL** comme base de données principale, avec **Drizzle ORM** pour une couche d'accès type-safe.

### Technologies

| Outil | Version | Usage |
|-------|---------|-------|
| **PostgreSQL** | 15+ | SGBD relationnel |
| **Drizzle ORM** | 0.34.0 | ORM TypeScript |
| **Neon** | - | PostgreSQL serverless (production) |

### Configuration

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
} satisfies Config;
```

---

## Schéma de la base de données

### Diagramme ERD

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │     Agent       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ email           │       │ name            │
│ password        │       │ description     │
│ name            │       │ model           │
│ image           │       │ systemPrompt    │
│ isAnonymous     │       │ userId (FK)     │◄──┐
│ createdAt       │       │ createdAt       │   │
│ updatedAt       │       └─────────────────┘   │
└────────┬────────┘                              │
         │                                       │
         │  ┌────────────────────────────────────┘
         │  │
         ▼  ▼
┌─────────────────┐       ┌─────────────────┐
│      Chat       │       │    Project      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ createdAt       │       │ name            │
│ title           │       │ description     │
│ userId (FK)     │◄──┐   │ userId (FK)     │
│ visibility      │   │   │ createdAt       │
│ agentId (FK)    │───┤   └─────────────────┘
│ projectId (FK)  │───┘
└────────┬────────┘
         │
         │  ┌──────────────────┐
         │  │                  │
         ▼  ▼                  │
┌─────────────────┐            │
│    Message_v2   │            │
├─────────────────┤            │
│ id (PK)         │            │
│ chatId (FK)     │            │
│ role            │            │
│ parts (JSON)    │            │
│ attachments     │            │
│ createdAt       │            │
└────────┬────────┘            │
         │                     │
         │  ┌──────────────────┘
         │  │
         ▼  ▼
┌─────────────────┐
│     Vote_v2     │
├─────────────────┤
│ chatId (PK, FK) │
│ messageId (PK)  │
│ isUpvoted       │
└─────────────────┘

┌─────────────────┐
│    Document     │
├─────────────────┤
│ id (PK)         │
│ createdAt (PK)  │
│ title           │
│ content         │
│ kind            │
│ userId (FK)     │
└─────────────────┘

┌─────────────────┐
│   Subscription  │
├─────────────────┤
│ id (PK)         │
│ userId (FK)     │
│ plan            │
│ activatedAt     │
│ expiresAt       │
└─────────────────┘

┌─────────────────┐
│      Usage      │
├─────────────────┤
│ id (PK)         │
│ userId (FK)     │
│ date            │
│ filesUploaded   │
│ messagesSent    │
│ ...             │
└─────────────────┘
```

---

## Tables détaillées

### User

Table des utilisateurs authentifiés.

```typescript
export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }), // Hashé avec bcrypt
  name: text("name"),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
```

**Index** :
- `email` (unique)
- `createdAt`

**Relations** :
- One-to-Many : Chats
- One-to-Many : Documents
- One-to-Many : Agents
- One-to-Many : Projects

---

### Chat

Conversations entre utilisateurs et IA.

```typescript
export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  agentId: uuid("agentId").references(() => agent.id),
  projectId: uuid("projectId").references(() => project.id),
});
```

**Index** :
- `userId`
- `createdAt DESC`
- `visibility`

**Relations** :
- Many-to-One : User
- Many-to-One : Agent (optionnel)
- Many-to-One : Project (optionnel)
- One-to-Many : Messages

---

### Message_v2

Messages individuels dans une conversation.

```typescript
export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id, { onDelete: 'cascade' }),
  role: varchar("role").notNull(), // "user" ou "assistant"
  parts: json("parts").notNull(), // Contenu structuré
  attachments: json("attachments").notNull().default([]),
  createdAt: timestamp("createdAt").notNull(),
});
```

**Index** :
- `chatId`
- `createdAt`

**Structure de `parts` (JSON)** :
```json
[
  {
    "type": "text",
    "content": "Bonjour ! Comment puis-je vous aider ?"
  }
]
```

**Structure de `attachments` (JSON)** :
```json
[
  {
    "url": "https://blob.vercel.storage/...",
    "filename": "document.pdf",
    "mimeType": "application/pdf"
  }
]
```

---

### Vote_v2

Votes sur les messages (upvote/downvote).

```typescript
export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id, { onDelete: 'cascade' }),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id, { onDelete: 'cascade' }),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  })
);
```

**Clé primaire composite** : `(chatId, messageId)`

---

### Document

Documents générés par l'IA (texte, code, images, sheets).

```typescript
export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { 
      enum: ["text", "code", "image", "sheet"] 
    })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
  })
);
```

**Clé primaire composite** : `(id, createdAt)`

**Index** :
- `userId`
- `kind`

---

### Agent

Agents IA personnalisés configurés par les utilisateurs.

```typescript
export const agent = pgTable("Agent", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  model: text("model").notNull(),
  systemPrompt: text("systemPrompt"),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});
```

**Index** :
- `userId`

---

### Project

Projets regroupant plusieurs conversations.

```typescript
export const project = pgTable("Project", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});
```

**Index** :
- `userId`

---

### Subscription

Abonnements premium des utilisateurs.

```typescript
export const subscription = pgTable("Subscription", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  plan: varchar("plan", { 
    enum: ["free", "plus", "pro", "max"] 
  })
    .notNull()
    .default("free"),
  activatedAt: timestamp("activatedAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt"),
});
```

**Index** :
- `userId` (unique)
- `plan`

---

### Usage

Tracking quotidien des quotas utilisateurs.

```typescript
export const usage = pgTable("Usage", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  filesUploaded: integer("filesUploaded").notNull().default(0),
  messagesSent: integer("messagesSent").notNull().default(0),
  imagesGenerated: integer("imagesGenerated").notNull().default(0),
  healthRequests: integer("healthRequests").notNull().default(0),
  newsSearches: integer("newsSearches").notNull().default(0),
}, (table) => ({
  uniqueUserDate: unique("unique_user_date").on(table.userId, table.date),
}));
```

**Contrainte unique** : `(userId, date)`

---

## Migrations

### Générer une migration

```bash
# Après modification du schema
pnpm db:generate

# Sortie typique :
# drizzle-kit: v0.25.0
# drizzle-orm: v0.34.0
# 
# Reading config file: /workspace/drizzle.config.ts
# Reading schema files: /workspace/lib/db/schema.ts
# Writing migrations to: /workspace/lib/db/migrations
# 
# ✅ Migration generated: 0001_fancy_penguin.sql
```

### Appliquer les migrations

```bash
# En développement
pnpm db:migrate

# En production (automatique au build)
pnpm build
```

### Structure des migrations

```
lib/db/migrations/
├── 0000_initial_schema.sql
├── 0001_add_subscription_table.sql
├── 0002_add_usage_tracking.sql
└── meta/
    ├── _journal.json
    └── 0000_snapshot.json
```

### Exemple de migration

```sql
-- 0001_add_subscription_table.sql
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE cascade UNIQUE,
  "plan" varchar DEFAULT 'free' NOT NULL,
  "activatedAt" timestamp DEFAULT now() NOT NULL,
  "expiresAt" timestamp
);

CREATE INDEX IF NOT EXISTS "subscription_user_idx" ON "Subscription" ("userId");
```

---

## Requêtes courantes

### Récupérer un utilisateur avec ses chats

```typescript
import { db } from '@/lib/db';
import { user, chat } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const result = await db.query.user.findFirst({
  where: eq(user.id, userId),
  with: {
    chats: {
      limit: 10,
      orderBy: (chats, { desc }) => [desc(chats.createdAt)],
    },
  },
});
```

### Créer une nouvelle conversation

```typescript
import { chat } from '@/lib/db/schema';

const newChat = await db.insert(chat).values({
  title: 'Nouvelle conversation',
  userId: user.id,
  createdAt: new Date(),
}).returning();
```

### Récupérer les messages d'un chat

```typescript
import { message } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

const messages = await db.query.message.findMany({
  where: eq(message.chatId, chatId),
  orderBy: asc(message.createdAt),
});
```

### Vérifier les quotas du jour

```typescript
import { usage } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

const today = new Date().toISOString().split('T')[0];

const userUsage = await db.query.usage.findFirst({
  where: and(
    eq(usage.userId, userId),
    eq(usage.date, today)
  ),
});

const canUpload = userUsage.filesUploaded < dailyLimit;
```

### Mettre à jour l'utilisation

```typescript
import { usage } from '@/lib/db/schema';

await db.insert(usage).values({
  userId,
  date: today,
  filesUploaded: 1,
}).onConflictDoUpdate({
  target: [usage.userId, usage.date],
  set: {
    filesUploaded: sql`${usage.filesUploaded} + 1`,
  },
});
```

### Récupérer l'historique avec pagination

```typescript
import { chat } from '@/lib/db/schema';
import { eq, desc, lt, and } from 'drizzle-orm';

const LIMIT = 20;

const chats = await db.query.chat.findMany({
  where: and(
    eq(chat.userId, userId),
    cursor ? lt(chat.createdAt, cursor) : undefined
  ),
  limit: LIMIT + 1,
  orderBy: desc(chat.createdAt),
});

const hasMore = chats.length > LIMIT;
const nextCursor = hasMore ? chats[LIMIT].createdAt : null;
const results = hasMore ? chats.slice(0, LIMIT) : chats;
```

---

## Optimisation

### Index recommandés

```sql
-- Pour les requêtes de liste de chats
CREATE INDEX CONCURRENTLY idx_chat_user_created 
ON "Chat" ("userId", "createdAt" DESC);

-- Pour la recherche de messages
CREATE INDEX CONCURRENTLY idx_message_chat_created 
ON "Message_v2" ("chatId", "createdAt");

-- Pour les quotas quotidiens
CREATE INDEX CONCURRENTLY idx_usage_user_date 
ON "Usage" ("userId", "date");
```

### Connection pooling

En production avec Neon :

```typescript
// lib/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.POSTGRES_URL!);
export const db = drizzle(sql);
```

### Requêtes préparées

Pour les requêtes fréquentes :

```typescript
const getChatById = db.query.chat.findFirst({
  where: eq(chat.id, placeholder('id')),
  with: {
    messages: {
      orderBy: asc(message.createdAt),
    },
  },
});

// Utilisation
const result = await getChatById.execute({ id: chatId });
```

### Vacuum automatique

PostgreSQL gère automatiquement le vacuum, mais vous pouvez optimiser :

```sql
-- Analyser les tables fréquemment mises à jour
ANALYZE "Message_v2";
ANALYZE "Usage";

-- Vacuum sur les grandes tables
VACUUM ANALYZE "Message_v2";
```

---

## Sauvegarde et restauration

### Exporter la base

```bash
# Avec pg_dump
pg_dump "$POSTGRES_URL" > backup.sql

# Avec Neon CLI
neonctl project export --project-id <id>
```

### Restaurer

```bash
psql "$POSTGRES_URL" < backup.sql
```

---

## Dépannage

### Erreur: "Too many connections"

**Solution** : Utiliser un pooler de connexions (PgBouncer) ou passer à Neon Serverless.

### Erreur: "Relation does not exist"

**Cause** : Migrations non appliquées.

**Solution** :
```bash
pnpm db:migrate
```

### Performance lente sur les messages

**Solutions** :
1. Ajouter un index sur `chatId`
2. Paginer les résultats
3. Utiliser le cache Redis pour les messages récents

---

## Ressources supplémentaires

- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://postgresql.org/docs)

---

<p align="center">
  <a href="/docs/README.md">← Retour à la documentation</a> • 
  <a href="/docs/api.md">API Reference →</a>
</p>
