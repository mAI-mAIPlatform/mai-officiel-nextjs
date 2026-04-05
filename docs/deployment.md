# Déploiement

Guide complet pour déployer mAI Chatbot en production sur différentes plateformes.

## 📋 Sommaire

- [Déploiement sur Vercel](#déploiement-sur-vercel)
- [Déploiement Docker](#déploiement-docker)
- [Déploiement manuel](#déploiement-manuel)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données en production](#base-de-données-en-production)
- [Monitoring et logs](#monitoring-et-logs)
- [Sécurité](#sécurité)

---

## Déploiement sur Vercel (Recommandé)

Vercel est la plateforme optimale pour déployer mAI Chatbot, avec une configuration minimale.

### Étape 1 : Préparer le projet

Assurez-vous que votre code est pushé sur GitHub, GitLab ou Bitbucket.

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### Étape 2 : Importer le projet sur Vercel

1. Rendez-vous sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez votre repository Git
4. Sélectionnez le framework **Next.js** (détection automatique)

### Étape 3 : Configurer les variables d'environnement

Dans **Project Settings → Environment Variables**, ajoutez :

| Variable | Production | Preview | Development |
|----------|------------|---------|-------------|
| `AUTH_SECRET` | ✅ | ✅ | ✅ |
| `BLOB_READ_WRITE_TOKEN` | ✅ | ✅ | ✅ |
| `POSTGRES_URL` | ✅ | ✅ | ✅ |
| `REDIS_URL` | ✅ | ✅ | ✅ |
| `MAI_PLUS` | ✅ | ✅ | ✅ |
| `MAI_PRO` | ✅ | ✅ | ✅ |
| `MAI_MAX` | ✅ | ✅ | ✅ |

**Note** : `AI_GATEWAY_API_KEY` n'est **pas nécessaire** sur Vercel grâce à l'OIDC.

### Étape 4 : Configurer la base de données

#### Option A : Neon (Recommandé)

1. Créez un compte sur [neon.tech](https://neon.tech)
2. Créez un nouveau projet
3. Copiez la connection string
4. Ajoutez-la dans Vercel : `POSTGRES_URL`

#### Option B : Vercel Postgres

1. Dans Vercel → Storage → Postgres
2. Créez une nouvelle base
3. La variable est automatiquement ajoutée

### Étape 5 : Configurer le stockage Blob

1. Vercel → Storage → Blob
2. Créez un nouveau store
3. Copiez le token `BLOB_READ_WRITE_TOKEN`

### Étape 6 : Configurer Redis

1. Vercel → Storage → Redis (Upstash)
2. Créez une nouvelle instance
3. Copiez l'URL `REDIS_URL`

### Étape 7 : Déployer

Cliquez sur **"Deploy"** !

Vercel va :
- Installer les dépendances (`pnpm install`)
- Générer les migrations Drizzle
- Builder l'application (`pnpm build`)
- Déployer sur le Edge Network

### Étape 8 : Appliquer les migrations

Les migrations sont appliquées automatiquement au build. Vérifiez dans :

**Vercel Dashboard → Functions → Logs**

### Étape 9 : Configurer le domaine

1. Allez dans **Project Settings → Domains**
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS chez votre registrar

```
Type: CNAME
Name: @ ou www
Value: cname.vercel-dns.com
```

---

## Déploiement Docker

Pour déployer sur votre propre infrastructure ou un cloud provider.

### Dockerfile

Créez un fichier `Dockerfile` à la racine :

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV AI_GATEWAY_USE_OIDC 0

RUN corepack enable pnpm && pnpm db:generate
RUN corepack enable pnpm && pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - AUTH_SECRET=${AUTH_SECRET}
      - AI_GATEWAY_API_KEY=${AI_GATEWAY_API_KEY}
      - BLOB_READ_WRITE_TOKEN=${BLOB_READ_WRITE_TOKEN}
      - POSTGRES_URL=${POSTGRES_URL}
      - REDIS_URL=${REDIS_URL}
      - MAI_PLUS=${MAI_PLUS}
      - MAI_PRO=${MAI_PRO}
      - MAI_MAX=${MAI_MAX}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=mai
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=mai_chatbot
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Build et run

```bash
# Build l'image
docker build -t mai-chatbot .

# Run avec docker-compose
docker-compose up -d

# Ou run direct
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  mai-chatbot
```

### Déploiement sur Kubernetes

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mai-chatbot
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mai-chatbot
  template:
    metadata:
      labels:
        app: mai-chatbot
    spec:
      containers:
      - name: mai-chatbot
        image: your-registry/mai-chatbot:latest
        ports:
        - containerPort: 3000
        env:
        - name: AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: mai-secrets
              key: auth-secret
        # ... autres variables
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## Déploiement manuel

Sur un serveur VPS (OVH, DigitalOcean, Linode, etc.).

### Prérequis

- Serveur Ubuntu 22.04+
- Node.js 20+
- pnpm
- PostgreSQL 15+
- Redis 7+
- Nginx (reverse proxy)
- PM2 (process manager)

### Installation

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installer pnpm
npm install -g pnpm

# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Installer Redis
sudo apt install -y redis-server

# Installer Nginx
sudo apt install -y nginx

# Installer PM2
sudo npm install -g pm2
```

### Configuration PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE mai_chatbot;
CREATE USER mai_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mai_chatbot TO mai_user;
\q
```

### Cloner et installer

```bash
cd /var/www
git clone https://github.com/your-org/chatbot.git
cd chatbot

pnpm install
pnpm db:generate
pnpm db:migrate
pnpm build
```

### Fichier .env.production

```bash
nano .env.production

# Contenu :
AUTH_SECRET=your-secret
AI_GATEWAY_API_KEY=your-gateway-key
BLOB_READ_WRITE_TOKEN=your-blob-token
POSTGRES_URL=postgresql://mai_user:password@localhost:5432/mai_chatbot
REDIS_URL=redis://localhost:6379
MAI_PLUS=your-plus-code
MAI_PRO=your-pro-code
MAI_MAX=your-max-code
```

### PM2 configuration

```bash
# Créer ecosystem.config.js
nano ecosystem.config.js

module.exports = {
  apps: [{
    name: 'mai-chatbot',
    script: 'pnpm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    max_memory_restart: '500M',
  }],
};

# Démarrer
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/mai-chatbot

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /_next/static {
        alias /var/www/chatbot/.next/static;
        expires 365d;
        access_log off;
    }
}

# Activer
sudo ln -s /etc/nginx/sites-available/mai-chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL avec Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Variables d'environnement

### Production checklist

```bash
# Obligatoires
✅ AUTH_SECRET=$(openssl rand -base64 32)
✅ POSTGRES_URL=postgresql://...
✅ REDIS_URL=redis://...
✅ BLOB_READ_WRITE_TOKEN=vercel_blob_...
✅ MAI_PLUS=$(openssl rand -hex 16)
✅ MAI_PRO=$(openssl rand -hex 16)
✅ MAI_MAX=$(openssl rand -hex 16)

# Pour déploiements non-Vercel
✅ AI_GATEWAY_API_KEY=your-gateway-key

# Optionnels
⚪ CEREBRAS_API_KEY=csb-...
⚪ MISTRAL_API_KEY=your-mistral-key
⚪ IS_DEMO=0
```

### Validation post-déploiement

```bash
# Tester la connexion DB
psql "$POSTGRES_URL" -c "SELECT 1;"

# Tester Redis
redis-cli -u "$REDIS_URL" ping

# Tester l'API
curl https://your-domain.com/api/models
```

---

## Base de données en production

### Neon (Recommandé)

Avantages :
- Serverless, pas de gestion de capacité
- Branches de base de données pour preview
- Scale automatique
- Backup automatique

Configuration :
```bash
# Connection string avec pooling
POSTGRES_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require

# Avec pooler de connexions
POSTGRES_URL=postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/db?sslmode=require
```

### Vercel Postgres

Avantages :
- Intégration native Vercel
- Setup en 1 clic
- Facturation unifiée

Limitations :
- Moins flexible que Neon
- Tailles de base limitées

### Auto-hébergé PostgreSQL

Requirements :
```yaml
RAM: 2GB minimum
CPU: 2 cores
Stockage: 20GB SSD
Backup: pg_dump quotidien
```

Configuration optimisée (`/etc/postgresql/15/main/postgresql.conf`) :
```conf
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
max_connections = 100
```

---

## Monitoring et logs

### Vercel Analytics

Activez dans **Project Settings → Analytics** :
- Web Analytics (trafic)
- Speed Insights (performance)
- Log Drains (logs vers external)

### Logs en temps réel

```bash
# Vercel CLI
vercel logs your-project

# PM2
pm2 logs mai-chatbot

# Docker
docker-compose logs -f app
```

### Alerting

Configurez des alertes pour :
- Erreurs 5xx > 1%
- Latence P95 > 2s
- Disponibilité < 99.9%

Outils recommandés :
- Sentry (erreurs)
- Datadog (monitoring complet)
- UptimeRobot (disponibilité)

---

## Sécurité

### Checklist sécurité

- [ ] HTTPS activé (Let's Encrypt)
- [ ] Headers de sécurité configurés
- [ ] Rate limiting activé
- [ ] Secrets non-committés dans Git
- [ ] Database backups automatisés
- [ ] Logs centralisés
- [ ] Monitoring actif

### Headers de sécurité (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;" always;
```

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Ressources supplémentaires

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

<p align="center">
  <a href="/docs/README.md">← Retour à la documentation</a> • 
  <a href="/docs/configuration.md">Configuration →</a>
</p>
