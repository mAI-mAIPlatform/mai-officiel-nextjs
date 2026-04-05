# API Reference

Documentation complète des endpoints API de mAI Chatbot.

## 📋 Sommaire

- [Vue d'ensemble](#vue-densemble)
- [Authentification](#authentification)
- [Endpoints Chat](#endpoints-chat)
- [Endpoints Utilisateurs](#endpoints-utilisateurs)
- [Endpoints Agents](#endpoints-agents)
- [Endpoints Projets](#endpoints-projets)
- [Endpoints Subscription](#endpoints-subscription)
- [Endpoints Fichiers](#endpoints-fichiers)
- [Autres endpoints](#autres-endpoints)
- [Codes d'erreur](#codesderreur)

---

## Vue d'ensemble

Toutes les API sont accessibles via `/api/*` et retournent du JSON.

### Base URL

```
Développement: http://localhost:3000/api
Production: https://votre-domaine.com/api
```

### Authentification

La plupart des endpoints nécessitent une session Auth.js valide. Les cookies de session sont automatiquement inclus dans les requêtes.

### Format des réponses

**Succès (2xx)** :
```json
{
  "success": true,
  "data": { ... }
}
```

**Erreur (4xx, 5xx)** :
```json
{
  "success": false,
  "error": "Description de l'erreur",
  "code": "ERROR_CODE"
}
```

---

## Authentification

### POST `/api/auth/signin`

Connexion utilisateur avec email/mot de passe.

**Body** :
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponse** :
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### POST `/api/auth/signup`

Inscription d'un nouvel utilisateur.

**Body** :
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "name": "John Doe"
}
```

**Réponse** :
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

---

### POST `/api/auth/signout`

Déconnexion de l'utilisateur.

**Réponse** :
```json
{
  "success": true
}
```

---

### GET `/api/auth/session`

Récupérer la session courante.

**Réponse** :
```json
{
  "success": true,
  "session": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "expires": "2024-12-31T23:59:59Z"
  }
}
```

---

## Endpoints Chat

### GET `/api/chat`

Lister toutes les conversations de l'utilisateur.

**Query params** :
| Param | Type | Description |
|-------|------|-------------|
| `limit` | number | Nombre max de résultats (défaut: 20) |
| `cursor` | string | Pagination cursor |

**Réponse** :
```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "id": "uuid",
        "title": "Ma conversation",
        "createdAt": "2024-01-01T10:00:00Z",
        "updatedAt": "2024-01-01T12:00:00Z",
        "messageCount": 15
      }
    ],
    "hasMore": false,
    "nextCursor": null
  }
}
```

---

### GET `/api/chat/[id]`

Récupérer une conversation spécifique.

**Params** :
- `id` (path) : UUID de la conversation

**Réponse** :
```json
{
  "success": true,
  "data": {
    "chat": {
      "id": "uuid",
      "title": "Ma conversation",
      "createdAt": "2024-01-01T10:00:00Z",
      "messages": [
        {
          "id": "uuid",
          "role": "user",
          "content": "Bonjour",
          "createdAt": "2024-01-01T10:00:00Z"
        },
        {
          "id": "uuid",
          "role": "assistant",
          "content": "Bonjour ! Comment puis-je vous aider ?",
          "createdAt": "2024-01-01T10:00:05Z"
        }
      ]
    }
  }
}
```

---

### POST `/api/chat`

Créer une nouvelle conversation.

**Body** :
```json
{
  "title": "Nouvelle conversation",
  "agentId": "uuid-optionnel",
  "projectId": "uuid-optionnel"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "chatId": "nouveau-uuid"
  }
}
```

---

### DELETE `/api/chat/[id]`

Supprimer une conversation.

**Réponse** :
```json
{
  "success": true,
  "message": "Conversation supprimée"
}
```

---

### PUT `/api/chat/[id]`

Mettre à jour une conversation (titre, visibilité).

**Body** :
```json
{
  "title": "Nouveau titre",
  "visibility": "private"
}
```

---

### POST `/api/chat/[id]/message`

Envoyer un message dans une conversation.

**Body** :
```json
{
  "content": "Mon message",
  "model": "moonshotai/kimi-k2-0905",
  "attachments": ["url1", "url2"]
}
```

**Réponse (streaming)** :
```
data: {"type": "start"}
data: {"type": "text", "text": "Bonjour"}
data: {"type": "text", "text": " !"}
data: {"type": "done"}
```

---

### POST `/api/vote`

Voter pour un message (upvote/downvote).

**Body** :
```json
{
  "chatId": "uuid",
  "messageId": "uuid",
  "isUpvoted": true
}
```

**Réponse** :
```json
{
  "success": true
}
```

---

### GET `/api/history`

Récupérer l'historique complet des conversations.

**Query params** :
| Param | Type | Description |
|-------|------|-------------|
| `from` | date | Date de début |
| `to` | date | Date de fin |

---

## Endpoints Utilisateurs

### GET `/api/user/me`

Récupérer le profil de l'utilisateur courant.

**Réponse** :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "image": "https://...",
      "plan": "pro",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### PUT `/api/user/me`

Mettre à jour le profil utilisateur.

**Body** :
```json
{
  "name": "Nouveau nom",
  "image": "https://..."
}
```

---

### GET `/api/user/usage`

Récupérer l'utilisation des quotas.

**Réponse** :
```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "usage": {
      "filesToday": 5,
      "filesPerDay": 20,
      "messagesThisHour": 12,
      "messagesPerHour": 50,
      "imagesThisWeek": 2,
      "imagesPerWeek": 4,
      "healthRequestsThisMonth": 3,
      "healthRequestsPerMonth": 15
    }
  }
}
```

---

## Endpoints Agents

### GET `/api/agents`

Lister tous les agents de l'utilisateur.

**Réponse** :
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "uuid",
        "name": "Assistant Code",
        "description": "Spécialisé en programmation",
        "model": "mistral/codestral",
        "systemPrompt": "Tu es un expert en code...",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### POST `/api/agents`

Créer un nouvel agent.

**Body** :
```json
{
  "name": "Assistant Code",
  "description": "Spécialisé en programmation",
  "model": "mistral/codestral",
  "systemPrompt": "Tu es un expert en code..."
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "agentId": "nouveau-uuid"
  }
}
```

---

### GET `/api/agents/[id]`

Récupérer un agent spécifique.

---

### PUT `/api/agents/[id]`

Mettre à jour un agent.

**Body** :
```json
{
  "name": "Nouveau nom",
  "systemPrompt": "Nouveau prompt système"
}
```

---

### DELETE `/api/agents/[id]`

Supprimer un agent.

---

## Endpoints Projets

### GET `/api/projects`

Lister tous les projets de l'utilisateur.

**Réponse** :
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "name": "Mon Projet",
        "description": "Description du projet",
        "chatCount": 5,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### POST `/api/projects`

Créer un nouveau projet.

**Body** :
```json
{
  "name": "Mon Projet",
  "description": "Description optionnelle"
}
```

---

### GET `/api/projects/[id]`

Récupérer un projet avec ses conversations.

---

### PUT `/api/projects/[id]`

Mettre à jour un projet.

---

### DELETE `/api/projects/[id]`

Supprimer un projet.

---

## Endpoints Subscription

### POST `/api/subscription/activate`

Activer un code d'abonnement premium.

**Body** :
```json
{
  "code": "MAI_PLUS_CODE_HERE"
}
```

**Réponses** :

✅ **200 OK** - Activation réussie
```json
{
  "success": true,
  "plan": "plus",
  "message": "Plan mAI+ activé avec succès"
}
```

❌ **400 Bad Request** - Code invalide
```json
{
  "success": false,
  "error": "Code d'activation invalide"
}
```

❌ **409 Conflict** - Déjà ce plan ou supérieur
```json
{
  "success": false,
  "error": "Vous avez déjà ce plan ou un plan supérieur"
}
```

---

### GET `/api/subscription/status`

Récupérer le statut de l'abonnement.

**Réponse** :
```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "activatedAt": "2024-01-01T00:00:00Z",
    "limits": {
      "filesPerDay": 20,
      "maxFileSizeMb": 100,
      "messagesPerHour": 50,
      "coderCredits": 75,
      "imagesPerWeek": 4,
      "healthRequestsPerMonth": 15
    }
  }
}
```

---

## Endpoints Fichiers

### POST `/api/files/upload`

Uploader un fichier.

**Headers** :
```
Content-Type: multipart/form-data
```

**Body** (FormData) :
```
file: <binary file>
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "url": "https://blob.vercel.storage/...",
    "filename": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf"
  }
}
```

**Limites par plan** :
| Plan | Taille max | Fichiers/jour |
|------|------------|---------------|
| Free | 10 MB | 3 |
| Plus | 50 MB | 10 |
| Pro | 100 MB | 20 |
| Max | 200 MB | 50 |

---

### DELETE `/api/files/[id]`

Supprimer un fichier.

---

### GET `/api/files`

Lister tous les fichiers de l'utilisateur.

**Query params** :
| Param | Type | Description |
|-------|------|-------------|
| `limit` | number | Limite de résultats |
| `type` | string | Filtre par type MIME |

---

## Autres endpoints

### GET `/api/models`

Lister tous les modèles IA disponibles.

**Réponse** :
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "moonshotai/kimi-k2-0905",
        "name": "Kimi K2 0905",
        "provider": "moonshotai",
        "description": "Modèle généraliste efficace...",
        "capabilities": {
          "tools": true,
          "vision": false,
          "reasoning": false
        }
      }
    ],
    "defaultModel": "moonshotai/kimi-k2-0905"
  }
}
```

---

### GET `/api/news/search`

Rechercher des actualités.

**Query params** :
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Terme de recherche |
| `limit` | number | Nombre de résultats |

**Réponse** :
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "title": "Titre de l'article",
        "summary": "Résumé...",
        "url": "https://...",
        "publishedAt": "2024-01-01T00:00:00Z",
        "source": "Source Name"
      }
    ]
  }
}
```

---

### POST `/api/export`

Exporter les données utilisateur (GDPR).

**Body** :
```json
{
  "includeChats": true,
  "includeFiles": true,
  "format": "json"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://blob.vercel.storage/export-uuid.zip",
    "expiresAt": "2024-01-02T00:00:00Z"
  }
}
```

---

### GET `/api/suggestions`

Obtenir des suggestions de prompts.

**Réponse** :
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "Rédige un plan projet pour lancer une nouvelle fonctionnalité IA.",
      "Crée un résumé des actions à faire cette semaine avec priorités.",
      "Aide-moi à structurer une base de connaissances pour mon équipe."
    ]
  }
}
```

---

## Codes d'erreur

### HTTP Status Codes

| Code | Signification | Causes courantes |
|------|---------------|------------------|
| `200` | Succès | Requête traitée avec succès |
| `201` | Créé | Ressource créée avec succès |
| `400` | Bad Request | Données invalides, validation échouée |
| `401` | Non autorisé | Session expirée, non connecté |
| `403` | Interdit | Permissions insuffisantes |
| `404` | Non trouvé | Ressource inexistante |
| `409` | Conflit | Déjà existe, doublon |
| `429` | Too Many Requests | Limite de quota atteinte |
| `500` | Server Error | Erreur interne serveur |

### Codes d'erreur spécifiques

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Email ou mot de passe incorrect |
| `EMAIL_ALREADY_USED` | Email déjà enregistré |
| `CHAT_NOT_FOUND` | Conversation introuvable |
| `QUOTA_EXCEEDED` | Limite de quota dépassée |
| `FILE_TOO_LARGE` | Fichier trop volumineux |
| `INVALID_MODEL` | Modèle IA inexistant |
| `SUBSCRIPTION_ACTIVE` | Abonnement déjà actif |
| `INVALID_ACTIVATION_CODE` | Code d'activation invalide |

---

## Exemples d'utilisation

### JavaScript (Fetch)

```javascript
// Récupérer les conversations
const response = await fetch('/api/chat');
const data = await response.json();

if (data.success) {
  console.log('Conversations:', data.data.chats);
}

// Envoyer un message
const messageResponse = await fetch('/api/chat/uuid/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Bonjour !',
    model: 'moonshotai/kimi-k2-0905'
  })
});
```

### TypeScript (avec types)

```typescript
interface Chat {
  id: string;
  title: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function getChats(): Promise<Chat[]> {
  const res = await fetch('/api/chat');
  const json: ApiResponse<{ chats: Chat[] }> = await res.json();
  
  if (!json.success) {
    throw new Error(json.error);
  }
  
  return json.data!.chats;
}
```

---

## Ressources supplémentaires

- [Configuration](configuration.md) - Variables d'environnement
- [Architecture](architecture.md) - Flux de données API
- [Subscription](subscription.md) - Système de quotas

---

<p align="center">
  <a href="/docs/README.md">← Retour à la documentation</a> • 
  <a href="/docs/database.md">Base de données →</a>
</p>
