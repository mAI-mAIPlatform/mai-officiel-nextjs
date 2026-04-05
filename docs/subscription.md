# Système d'abonnement

mAI Chatbot intègre un système complet de gestion des abonnements avec quotas personnalisés pour chaque plan.

## 📋 Sommaire

- [Plans disponibles](#plans-disponibles)
- [Quotas et limites](#quotas-et-limites)
- [Activation des plans](#activation-des-plans)
- [Architecture technique](#architecture-technique)
- [Gestion des quotas](#gestion-des-quotas)
- [Personnalisation](#personnalisation)

---

## Plans disponibles

mAI propose 4 niveaux d'abonnement :

### 🆓 mAI Free

**Public** : Utilisateurs gratuits, découverte de la plateforme

| Limite | Valeur |
|--------|--------|
| Fichiers par jour | 3 |
| Taille max fichier | 10 MB |
| Quiz par jour | 2 |
| Unités de mémoire | 50 |
| Messages par heure | 10 |
| Coder Credits | 30 |
| Images par semaine | 2 |
| Task Schedules | 2 |
| Recherches news/jour | 3 |
| Requêtes santé/mois | 5 |

---

### 💎 mAI Plus (mAI+)

**Public** : Utilisateurs réguliers souhaitant plus de fonctionnalités

| Limite | Valeur | Progression vs Free |
|--------|--------|---------------------|
| Fichiers par jour | 10 | +233% |
| Taille max fichier | 50 MB | +400% |
| Quiz par jour | 10 | +400% |
| Unités de mémoire | 75 | +50% |
| Messages par heure | 30 | +200% |
| Coder Credits | 50 | +67% |
| Images par semaine | 3 | +50% |
| Task Schedules | 5 | +150% |
| Recherches news/jour | 5 | +67% |
| Requêtes santé/mois | 10 | +100% |

---

### ⭐ mAI Pro (Recommandé)

**Public** : Power users et professionnels

| Limite | Valeur | Progression vs Plus |
|--------|--------|---------------------|
| Fichiers par jour | 20 | +100% |
| Taille max fichier | 100 MB | +100% |
| Quiz par jour | 20 | +100% |
| Unités de mémoire | 100 | +33% |
| Messages par heure | 50 | +67% |
| Coder Credits | 75 | +50% |
| Images par semaine | 4 | +33% |
| Task Schedules | 10 | +100% |
| Recherches news/jour | 10 | +100% |
| Requêtes santé/mois | 15 | +50% |

---

### 🚀 mAI Max

**Public** : Entreprises et utilisateurs intensifs

| Limite | Valeur | Progression vs Pro |
|--------|--------|---------------------|
| Fichiers par jour | 50 | +150% |
| Taille max fichier | 200 MB | +100% |
| Quiz par jour | **Illimités** | ∞ |
| Unités de mémoire | 200 | +100% |
| Messages par heure | 200 | +300% |
| Coder Credits | 150 | +100% |
| Images par semaine | 5 | +25% |
| Task Schedules | 20 | +100% |
| Recherches news/jour | 20 | +100% |
| Requêtes santé/mois | 25 | +67% |

---

## Activation des plans

### Codes d'activation

Les plans premium sont activés via des codes secrets configurés dans les variables d'environnement :

```env
MAI_PLUS=code-secret-plus-genere-aleatoirement
MAI_PRO=code-secret-pro-genere-aleatoirement
MAI_MAX=code-secret-max-genere-aleatoirement
```

### Génération des codes

```bash
# Générer des codes sécurisés
openssl rand -hex 16  # Pour chaque plan

# Exemple de sortie
# MAI_PLUS=a3f8b2c1d4e5f6789012345678901234
# MAI_PRO=b4g9c3d2e5f6g7890123456789012345
# MAI_MAX=c5h0d4e3f6g7h8901234567890123456
```

### Processus d'activation

1. L'utilisateur accède à la page **Pricing** ou **Settings**
2. Il saisit le code d'activation dans le formulaire dédié
3. Le code est validé côté serveur via l'endpoint `/api/subscription/activate`
4. Le plan est stocké dans `localStorage` et persisté en base de données
5. Les limites sont appliquées immédiatement

### Endpoint d'activation

**POST** `/api/subscription/activate`

**Body** :
```json
{
  "code": "MAI_PLUS_CODE_HERE"
}
```

**Réponses possibles** :

✅ **200 OK** - Code valide, plan activé
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

## Architecture technique

### Structure des données

**Fichier** : `lib/subscription.ts`

```typescript
type PlanKey = "free" | "plus" | "pro" | "max";

type PlanLimits = {
  filesPerDay: number;
  maxFileSizeMb: number;
  quizPerDay: number | "illimites";
  memoryUnits: number;
  messagesPerHour: number;
  coderCredits: number;
  imagesPerWeek: number;
  taskSchedules: number;
  newsSearchesPerDay: number;
  healthRequestsPerMonth: number;
};

type PlanDefinition = {
  key: PlanKey;
  label: string;
  recommended?: boolean;
  limits: PlanLimits;
};
```

### Hook React

**Fichier** : `hooks/use-subscription-plan.ts`

```typescript
// Utilisation dans un composant
import { useSubscriptionPlan } from '@/hooks/use-subscription-plan';

function MyComponent() {
  const { plan, limits, canUploadFile, canSendMessage } = useSubscriptionPlan();
  
  return (
    <div>
      <p>Plan actuel: {plan.label}</p>
      <p>Fichiers restants today: {limits.filesPerDay}</p>
    </div>
  );
}
```

### Stockage

- **Client** : `localStorage` avec clé `mai.subscription.plan.v013`
- **Serveur** : Table `Subscription` dans PostgreSQL
- **Validation** : Uniquement côté serveur pour les codes premium

---

## Gestion des quotas

### Vérification des limites

Chaque action critique vérifie les quotas avant exécution :

```typescript
// Exemple: Upload de fichier
async function handleFileUpload(file: File) {
  const { limits, usage } = useSubscriptionPlan();
  
  // Vérifier la limite journalière
  if (usage.filesToday >= limits.filesPerDay) {
    throw new Error('Limite quotidienne atteinte');
  }
  
  // Vérifier la taille
  if (file.size > limits.maxFileSizeMb * 1024 * 1024) {
    throw new Error(`Fichier trop volumineux (max: ${limits.maxFileSizeMb}MB)`);
  }
  
  // Proceed with upload...
}
```

### Reset des quotas

Les quotas se reset automatiquement selon leur période :

| Quota | Période de reset |
|-------|------------------|
| filesPerDay | Minuit UTC |
| quizPerDay | Minuit UTC |
| messagesPerHour | Glissant (1 heure) |
| imagesPerWeek | Lundi 00:00 UTC |
| healthRequestsPerMonth | 1er du mois 00:00 UTC |

### Tracking de l'utilisation

L'utilisation est trackée dans la table `Usage` :

```sql
CREATE TABLE Usage (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES User(id),
  date DATE NOT NULL,
  filesUploaded INTEGER DEFAULT 0,
  messagesSent INTEGER DEFAULT 0,
  imagesGenerated INTEGER DEFAULT 0,
  -- autres compteurs...
  UNIQUE(userId, date)
);
```

---

## Personnalisation

### Ajouter un nouveau plan

1. **Définir le plan** dans `lib/subscription.ts` :

```typescript
planDefinitions: Record<PlanKey, PlanDefinition> = {
  // ... plans existants
  enterprise: {
    key: "enterprise",
    label: "mAI Enterprise",
    limits: {
      filesPerDay: 200,
      maxFileSizeMb: 500,
      quizPerDay: "illimites",
      memoryUnits: 1000,
      messagesPerHour: 1000,
      coderCredits: 500,
      imagesPerWeek: 20,
      taskSchedules: 100,
      newsSearchesPerDay: 100,
      healthRequestsPerMonth: 100,
    },
  },
};
```

2. **Ajouter le code d'activation** dans `.env` :

```env
MAI_ENTERPRISE=your-enterprise-code
```

3. **Mettre à jour la logique de validation** dans `app/(auth)/actions.ts`

### Modifier les limites d'un plan

Éditez directement dans `lib/subscription.ts` :

```typescript
pro: {
  key: "pro",
  label: "mAI Pro",
  recommended: true,
  limits: {
    filesPerDay: 20,  // ← Modifiez cette valeur
    // ... autres limites
  },
},
```

### Upgrade path

La configuration actuelle définit les upgrades possibles :

```typescript
export const planUpgradeTargetByCurrentPlan: Record<PlanKey, PlanKey | null> = {
  free: "plus",
  plus: "pro",
  pro: "max",
  max: null,  // Pas d'upgrade au-delà de Max
};
```

---

## Interface utilisateur

### Page Pricing

Accessible via `/pricing`, présente les 4 plans avec :

- Tableau comparatif des limites
- Bouton d'activation de code
- Indicateur du plan actuel
- Suggestions d'upgrade

### Composants UI

**Badge de plan** :
```tsx
<PlanBadge plan={plan} />
// Affiche: "Free", "Plus", "Pro" (avec étoile), ou "Max"
```

**Barre de progression** :
```tsx
<UsageProgress 
  current={usage.filesToday} 
  limit={limits.filesPerDay} 
  label="Fichiers aujourd'hui" 
/>
```

**Alerte de limite** :
```tsx
{isLimitReached && (
  <Alert variant="warning">
    Vous avez atteint votre limite. 
    <Link href="/pricing">Upgradez votre plan</Link>
  </Alert>
)}
```

---

## Sécurité

### Validation serveur

⚠️ **Important** : La validation des codes premium se fait **uniquement côté serveur**.

Le client ne fait que :
- Stocker temporairement le plan dans `localStorage`
- Afficher les limites associées
- Guider l'UX en fonction du plan

Toute action critique est re-validée côté serveur avec :
- Récupération du plan depuis la base de données
- Vérification des quotas réels
- Application des limites avant exécution

### Protection contre l'abus

1. **Rate limiting** sur l'endpoint d'activation
2. **Hashage des codes** en base de données
3. **Logs d'activation** pour audit
4. **Expiration optionnelle** des codes (à implémenter)

---

## Dépannage

### Problème: Le plan ne se met pas à jour

**Causes possibles** :
1. Cache localStorage corrompu
2. Erreur de validation serveur
3. Code déjà utilisé

**Solutions** :
```javascript
// Clear localStorage et réessayer
localStorage.removeItem('mai.subscription.plan.v013');
window.location.reload();

// Vérifier les logs serveur
// App → Functions → subscription/activate
```

### Problème: Les quotas ne se reset pas

**Vérifications** :
1. Le cron job de reset est-il actif ?
2. La timezone du serveur est-elle UTC ?
3. Y a-t-il des erreurs dans les logs de migration ?

**Solution manuelle** :
```sql
-- Reset manuel pour un utilisateur (à utiliser avec précaution)
UPDATE Usage 
SET filesUploaded = 0, messagesSent = 0 
WHERE userId = 'user-uuid' AND date = CURRENT_DATE;
```

### Problème: Code d'activation rejeté

**Vérifications** :
```bash
# Vérifier que la variable env est définie
echo $MAI_PLUS
echo $MAI_PRO
echo $MAI_MAX

# Vérifier le format (doit correspondre exactement)
# Attention aux espaces, majuscules/minuscules
```

---

## Ressources supplémentaires

- [Configuration](configuration.md) - Variables d'environnement
- [API](api.md) - Endpoints liés aux abonnements
- [Base de données](database.md) - Schéma des tables Subscription et Usage

---

<p align="center">
  <a href="/docs/README.md">← Retour à la documentation</a> • 
  <a href="/docs/api.md">API Reference →</a>
</p>
