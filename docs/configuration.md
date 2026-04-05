# Configuration

Ce guide détaille toutes les variables d'environnement nécessaires pour exécuter mAI Chatbot.

## 📋 Sommaire

- [Variables requises](#variables-requises)
- [Variables optionnelles](#variables-optionnelles)
- [Configuration par environnement](#configuration-par-environnement)
- [Génération des secrets](#génération-des-secrets)
- [Dépannage](#dépannage)

---

## Variables requises

Ces variables doivent être définies dans votre fichier `.env.local` (développement) ou dans les variables d'environnement de votre plateforme d'hébergement (production).

### AUTH_SECRET

**Description** : Secret utilisé par Auth.js pour signer les tokens de session et les cookies.

**Génération** :
```bash
# Option 1: Utiliser OpenSSL
openssl rand -base64 32

# Option 2: Utiliser un générateur en ligne
# https://generate-secret.vercel.app/32

# Option 3: Utiliser Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Exemple** :
```env
AUTH_SECRET=your-secret-key-here-at-least-32-characters-long
```

---

### AI_GATEWAY_API_KEY

**Description** : Clé API pour accéder au Vercel AI Gateway, qui permet d'utiliser plusieurs fournisseurs de modèles IA via une interface unifiée.

**Obtention** :
1. Rendez-vous sur [Vercel AI Gateway](https://vercel.com/ai-gateway)
2. Connectez-vous avec votre compte Vercel
3. Créez une nouvelle clé API
4. Copiez la clé dans votre `.env.local`

**Note importante** : 
- Pour les déploiements **Vercel**, cette variable n'est **pas nécessaire** car l'authentification est gérée automatiquement via OIDC
- Pour les déploiements **non-Vercel** (Docker, serveur dédié, etc.), cette variable est **obligatoire**

**Exemple** :
```env
AI_GATEWAY_API_KEY=your-ai-gateway-api-key
```

---

### BLOB_READ_WRITE_TOKEN

**Description** : Token d'accès pour Vercel Blob Storage, utilisé pour stocker les fichiers uploadés par les utilisateurs (images, documents, etc.).

**Obtention** :
1. Allez sur le dashboard Vercel
2. Sélectionnez votre projet
3. Onglet "Storage" → "Blob"
4. Créez un nouveau store ou utilisez un existant
5. Copiez le token de lecture/écriture

**Exemple** :
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_token_here
```

---

### POSTGRES_URL

**Description** : URL de connexion à la base de données PostgreSQL. Utilisée par Drizzle ORM pour persister les conversations, utilisateurs, messages, etc.

**Options de providers** :

#### Neon (Recommandé)
```bash
# 1. Créez un compte sur https://neon.tech
# 2. Créez un nouveau projet
# 3. Copiez la connection string depuis le dashboard
```

#### Vercel Postgres
```bash
# 1. Dashboard Vercel → Storage → Postgres
# 2. Créez une nouvelle base de données
# 3. Copiez la connection string
```

#### Autre provider (Supabase, Railway, etc.)
```bash
# Format standard : postgresql://user:password@host:port/database
```

**Exemple** :
```env
POSTGRES_URL=postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require
```

---

### REDIS_URL

**Description** : URL de connexion à Redis, utilisée pour le rate limiting, le cache et les sessions temporaires.

**Options** :

#### Vercel Redis (Upstash)
```bash
# 1. Dashboard Vercel → Storage → Redis
# 2. Créez une nouvelle base Redis
# 3. Copiez l'URL de connexion
```

#### Upstash directement
```bash
# 1. https://upstash.com
# 2. Créez une base Redis
# 3. Copiez REST API ou connection string
```

**Exemple** :
```env
REDIS_URL=redis://default:password@host.upstash.io:port
```

---

### Codes d'activation premium

**MAI_PLUS**, **MAI_PRO**, **MAI_MAX**

**Description** : Codes secrets permettant aux utilisateurs d'activer des abonnements premium.

**Génération** :
```bash
# Générez des codes aléatoires sécurisés
openssl rand -hex 16  # Pour chaque plan
```

**Exemple** :
```env
MAI_PLUS=votre-code-plus-securise
MAI_PRO=votre-code-pro-securise
MAI_MAX=votre-code-max-securise
```

**Sécurité** : 
- Ces codes sont validés côté serveur uniquement
- Ne jamais les committer dans Git
- Utilisez des codes complexes (min. 32 caractères)

---

## Variables optionnelles

### CEREBRAS_API_KEY

**Description** : Clé API pour Cerebras Cloud, un provider low-cost pour les modèles Llama et Qwen.

**Obtention** : https://cloud.cerebras.ai

**Exemple** :
```env
CEREBRAS_API_KEY=csb-your-cerebras-api-key
```

---

### MISTRAL_API_KEY

**Description** : Clé API pour Mistral AI, permettant d'accéder directement aux modèles Mistral (Codestral, Ministral, etc.).

**Obtention** : https://console.mistral.ai/api-keys/

**Exemple** :
```env
MISTRAL_API_KEY=your-mistral-api-key
```

---

### CEREBRAS_API_BASE_URL

**Description** : URL de base custom pour l'API Cerebras (utile pour les proxies ou environnements spécifiques).

**Par défaut** : `https://api.cerebras.ai/v1`

**Exemple** :
```env
CEREBRAS_API_BASE_URL=https://api.cerebras.ai/v1
```

---

### MISTRAL_API_BASE_URL

**Description** : URL de base custom pour l'API Mistral.

**Par défaut** : `https://api.mistral.ai/v1`

**Exemple** :
```env
MISTRAL_API_BASE_URL=https://api.mistral.ai/v1
```

---

### IS_DEMO

**Description** : Active le mode démo pour limiter certaines fonctionnalités.

**Valeurs** : `0` (désactivé) ou `1` (activé)

**Exemple** :
```env
IS_DEMO=0
```

---

## Configuration par environnement

### Développement local (.env.local)

```bash
# Copiez ce template dans .env.local
AUTH_SECRET=dev-secret-change-in-production
AI_GATEWAY_API_KEY=your-dev-gateway-key
BLOB_READ_WRITE_TOKEN=dev-blob-token
POSTGRES_URL=postgresql://dev-db-connection
REDIS_URL=redis://dev-redis-url
MAI_PLUS=dev-plus-code
MAI_PRO=dev-pro-code
MAI_MAX=dev-max-code
```

### Production (Vercel)

Dans le dashboard Vercel → Project Settings → Environment Variables :

| Variable | Preview | Production |
|----------|---------|------------|
| `AUTH_SECRET` | ✅ | ✅ |
| `AI_GATEWAY_API_KEY` | ❌ (OIDC) | ❌ (OIDC) |
| `BLOB_READ_WRITE_TOKEN` | ✅ | ✅ |
| `POSTGRES_URL` | ✅ | ✅ |
| `REDIS_URL` | ✅ | ✅ |
| `MAI_*` | ✅ | ✅ |

**Note** : `AI_GATEWAY_API_KEY` n'est pas nécessaire sur Vercel grâce à l'OIDC.

### Production (Docker / Serveur dédié)

Assurez-vous que toutes les variables sont définies :

```bash
# Via docker-compose.yml
environment:
  - AUTH_SECRET=${AUTH_SECRET}
  - AI_GATEWAY_API_KEY=${AI_GATEWAY_API_KEY}
  - BLOB_READ_WRITE_TOKEN=${BLOB_READ_WRITE_TOKEN}
  - POSTGRES_URL=${POSTGRES_URL}
  - REDIS_URL=${REDIS_URL}
  - MAI_PLUS=${MAI_PLUS}
  - MAI_PRO=${MAI_PRO}
  - MAI_MAX=${MAI_MAX}
```

---

## Génération des secrets

### Script de génération rapide

Créez un fichier `generate-secrets.sh` :

```bash
#!/bin/bash

echo "# Generated secrets - $(date)" > .env.generated
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env.generated
echo "MAI_PLUS=$(openssl rand -hex 16)" >> .env.generated
echo "MAI_PRO=$(openssl rand -hex 16)" >> .env.generated
echo "MAI_MAX=$(openssl rand -hex 16)" >> .env.generated

echo "✅ Secrets générés dans .env.generated"
echo "⚠️ N'oubliez pas de configurer les autres variables manuellement !"
```

Exécution :
```bash
chmod +x generate-secrets.sh
./generate-secrets.sh
cat .env.generated >> .env.local
```

---

## Dépannage

### Erreur: "Invalid AUTH_SECRET"

**Cause** : Le secret est trop court ou mal formaté.

**Solution** :
```bash
# Régénérez un secret valide
openssl rand -base64 32
```

---

### Erreur: "AI Gateway authentication failed"

**Cause** : Clé API manquante ou invalide.

**Solutions** :
1. Vérifiez que `AI_GATEWAY_API_KEY` est défini (sauf sur Vercel)
2. Vérifiez que la clé est valide sur le dashboard AI Gateway
3. Redémarrez le serveur après modification

---

### Erreur: "Cannot connect to database"

**Cause** : URL de connexion PostgreSQL incorrecte.

**Solutions** :
1. Vérifiez le format de `POSTGRES_URL`
2. Assurez-vous que SSL est activé (`?sslmode=require`)
3. Testez la connexion avec `psql` :
   ```bash
   psql "$POSTGRES_URL"
   ```

---

### Erreur: "Rate limit exceeded" immédiatement

**Cause** : Redis mal configuré ou inaccessible.

**Solutions** :
1. Vérifiez que `REDIS_URL` est correct
2. Testez la connexion Redis :
   ```bash
   redis-cli -u "$REDIS_URL" ping
   ```
3. En développement, vous pouvez désactiver temporairement le rate limiting

---

## Checklist de validation

Avant de déployer en production, vérifiez :

- [ ] `AUTH_SECRET` est défini et fait au moins 32 caractères
- [ ] `AI_GATEWAY_API_KEY` est défini (si non-Vercel)
- [ ] `POSTGRES_URL` pointe vers une base de données production
- [ ] `REDIS_URL` est configuré pour la production
- [ ] Les codes `MAI_*` sont différents de ceux de développement
- [ ] Aucune valeur sensible n'est committée dans Git
- [ ] Les variables sont définies dans la plateforme d'hébergement

---

## Ressources supplémentaires

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Auth.js Configuration](https://authjs.dev/getting-started/deployment)
- [Drizzle ORM Setup](https://orm.drizzle.team/docs/get-started-postgresql)
- [Vercel AI Gateway Docs](https://vercel.com/docs/ai-gateway)

---

<p align="center">
  Besoin d'aide ? Consultez les <a href="/docs/README.md">autres guides</a> ou ouvrez une issue.
</p>
