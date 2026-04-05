# Modèles IA

mAI Chatbot supporte plus de 30 modèles de langage via plusieurs fournisseurs. Ce guide détaille la configuration et l'utilisation de chaque modèle.

## 📋 Sommaire

- [Architecture multi-providers](#architecture-multi-providers)
- [Modèles par catégorie](#modèles-par-catégorie)
- [Configuration des providers](#configuration-des-providers)
- [Sélection de modèle](#sélection-de-modèle)
- [Capabilités des modèles](#capabilités-des-modèles)
- [Bonnes pratiques](#bonnes-pratiques)

---

## Architecture multi-providers

Le projet utilise une architecture flexible permettant d'accéder aux modèles via :

1. **Vercel AI Gateway** - Interface unifiée pour les principaux providers
2. **Providers directs** - Connexion directe aux APIs (Mistral, Cerebras, etc.)
3. **OpenRouter** - Agrégateur avec modèles gratuits et premium
4. **Ollama** - Exécution locale pour confidentialité totale

### Fichier de configuration

Les modèles sont configurés dans `lib/ai/models.ts` :

```typescript
export const chatModels: ChatModel[] = [
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "deepseek",
    description: "Modèle polyvalent, rapide et fiable...",
    gatewayOrder: ["bedrock", "deepinfra"],
  },
  // ... autres modèles
];
```

---

## Modèles par catégorie

### 🔥 Via Vercel AI Gateway

Ces modèles utilisent le routing intelligent du AI Gateway avec fallback automatique.

| Modèle | ID | Provider | Usage recommandé |
|--------|-----|----------|------------------|
| **DeepSeek V3.2** | `deepseek/deepseek-v3.2` | DeepSeek | Tâches générales, outils |
| **Mistral Codestral** | `mistral/codestral` | Mistral | Code, débogage |
| **Mistral Small** | `mistral/mistral-small` | Mistral | Vision, rapidité |
| **Kimi K2 0905** | `moonshotai/kimi-k2-0905` | Moonshot | Conversations longues |
| **Kimi K2.5** | `moonshotai/kimi-k2.5` | Moonshot | Cas complexes premium |
| **GPT OSS 20B** | `openai/gpt-oss-20b` | OpenAI | Raisonnement léger |
| **GPT OSS 120B** | `openai/gpt-oss-120b` | OpenAI | Raisonnement avancé |
| **Grok 4.1 Fast** | `xai/grok-4.1-fast-non-reasoning` | xAI | Réponses rapides |

**Gateway Order** : Ordre de fallback en cas d'indisponibilité.

Exemple pour DeepSeek V3.2 :
```typescript
gatewayOrder: ["bedrock", "deepinfra"]
// 1. Tente AWS Bedrock
// 2. Fallback sur DeepInfra si Bedrock échoue
```

---

### 💰 Low-Cost (optimisés coût/performance)

#### Cerebras Cloud

Ultra-rapide et économique pour les traitements volumineux.

| Modèle | ID | Contexte | Prix approximatif |
|--------|-----|----------|------------------|
| Llama 3.1 8B | `cerebras/llama3.1-8b` | 8K tokens | ~$0.10/1M tokens |
| Qwen 3 32B | `cerebras/qwen-3-32b` | 32K tokens | ~$0.20/1M tokens |

**Configuration requise** :
```env
CEREBRAS_API_KEY=csb-your-api-key
```

#### Mistral API Direct

Accès direct aux modèles Mistral sans Gateway.

| Modèle | ID | Usage |
|--------|-----|-------|
| Ministral 3B | `mistral-api/ministral-3b-latest` | Budget contraint |
| Ministral 8B | `mistral-api/ministral-8b-latest` | Production équilibrée |

**Configuration requise** :
```env
MISTRAL_API_KEY=your-mistral-api-key
```

---

### 🆓 OpenRouter (Gratuits & Freemium)

OpenRouter agrège des modèles gratuits et low-cost.

#### Modèles Gratuits

| Modèle | ID | Limites |
|--------|-----|---------|
| Step 1 Flash | `openrouter/stepfun/step-1-flash:free` | Rate limited |
| LFM 40B Trinity | `openrouter/liquid/lfm-40b:free` | Rate limited |
| GLM-4 9B | `openrouter/zhipu/glm-4-9b-chat:free` | Rate limited |
| Gemini 2.0 Flash | `openrouter/google/gemini-2.0-flash-exp:free` | Rate limited |

#### Modèles Premium Low-Cost

| Modèle | ID | Prix approx. |
|--------|-----|--------------|
| Llama 3.3 70B | `openrouter/meta-llama/llama-3.3-70b-instruct` | ~$0.40/1M |
| Nemotron 70B | `openrouter/nvidia/llama-3.1-nemotron-70b-instruct` | ~$0.40/1M |
| Claude 3.5 Haiku | `openrouter/anthropic/claude-3.5-haiku` | ~$0.80/1M |
| GPT-4o Mini | `openrouter/openai/gpt-4o-mini` | ~$0.15/1M |
| DeepSeek V3 | `openrouter/deepseek/deepseek-chat` | ~$0.30/1M |

**Configuration requise** :
```env
OPENROUTER_API_KEY=sk-or-your-api-key
```

---

### 🌐 Google via CometAPI

Modèles Gemini optimisés pour production.

| Modèle | ID | Cas d'usage |
|--------|-----|-------------|
| GPT-5.4 Nano | `gpt-5.4-nano` | Tâches simples |
| GPT-5.4 Mini | `gpt-5.4-mini` | Usage général |
| Gemini 2.5 Flash Lite | `gemini-2.5-flash-lite` | Production |
| Gemini 2.5 Flash | `gemini-2.5-flash` | Haute qualité |
| Gemini 2.0 Flash Lite | `gemini-2.0-flash-lite` | Prototypage |

---

### 🏠 Local avec Ollama

Exécution locale pour confidentialité et autonomie.

| Modèle | ID | Taille | RAM requise |
|--------|-----|--------|-------------|
| Llama 3.1 | `ollama/llama3.1` | 8B | ~8 GB |
| Gemma 2 9B | `ollama/gemma2:9b` | 9B | ~10 GB |
| Mistral Nemo | `ollama/mistral-nemo` | 12B | ~14 GB |
| Phi 3.5 | `ollama/phi3.5` | 3.8B | ~4 GB |
| DeepSeek Coder V2 | `ollama/deepseek-coder-v2` | 16B | ~18 GB |

**Installation Ollama** :
```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Télécharger un modèle
ollama pull llama3.1
ollama pull gemma2:9b

# Vérifier que Ollama tourne
ollama list
```

**Configuration** :
```env
OLLAMA_HOST=http://localhost:11434
```

---

## Configuration des providers

### Vercel AI Gateway (Défaut)

Aucune configuration supplémentaire n'est nécessaire pour les déploiements Vercel.

Pour les déploiements non-Vercel :
```env
AI_GATEWAY_API_KEY=your-gateway-api-key
```

### OpenRouter

1. Créez un compte sur [OpenRouter](https://openrouter.ai)
2. Générez une clé API dans le dashboard
3. Ajoutez à `.env.local` :

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Ollama (Local)

1. Installez Ollama depuis [ollama.com](https://ollama.com)
2. Téléchargez les modèles souhaités :

```bash
ollama pull llama3.1
ollama pull mistral-nemo
ollama pull deepseek-coder-v2
```

3. Assurez-vous qu'Ollama est en cours d'exécution :

```bash
ollama serve
```

---

## Sélection de modèle

### Dans l'interface utilisateur

Les utilisateurs peuvent sélectionner un modèle via le sélecteur de modèle dans l'interface de chat.

### Par programme

```typescript
import { chatModels } from '@/lib/ai/models';

// Récupérer tous les modèles
const allModels = chatModels;

// Filtrer par provider
const openRouterModels = chatModels.filter(
  m => m.provider === 'openrouter'
);

// Modèle par défaut
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
// "moonshotai/kimi-k2-0905"
```

### Model Capabilities

Chaque modèle a des capabilités spécifiques détectées automatiquement :

```typescript
type ModelCapabilities = {
  tools: boolean;      // Support des appels de fonctions/outils
  vision: boolean;     // Analyse d'images
  reasoning: boolean;  // Mode raisonnement
};
```

Pour récupérer les capabilités :

```typescript
import { getCapabilities } from '@/lib/ai/models';

const capabilities = await getCapabilities();
// { "deepseek/deepseek-v3.2": { tools: true, vision: false, reasoning: false } }
```

---

## Capabilités des modèles

### Support des outils (Function Calling)

✅ **Support complet** :
- DeepSeek V3.2
- Mistral Codestral
- Mistral Small
- Kimi K2 series
- GPT-4o Mini
- Claude 3.5 Haiku

❌ **Non supporté** :
- Modèles gratuits OpenRouter (tag `:free`)
- La plupart des modèles Ollama

### Vision (Analyse d'images)

✅ **Avec vision** :
- Mistral Small
- Tous les modèles Gemini
- GPT-4o Mini
- Modèles avec "vision" dans l'ID

❌ **Texte uniquement** :
- Cerebras models
- Ministral series
- Most Ollama models

### Mode Raisonnement

✅ **Avec reasoning** :
- GPT OSS 20B (`reasoningEffort: "low"`)
- GPT OSS 120B (`reasoningEffort: "low"`)
- Modèles avec "reasoning" dans l'ID

---

## Bonnes pratiques

### Choix du modèle par cas d'usage

| Cas d'usage | Modèle recommandé | Alternative économique |
|-------------|-------------------|------------------------|
| **Chat général** | Kimi K2 0905 | Llama 3.3 70B (OR) |
| **Code** | Mistral Codestral | DeepSeek Coder V2 (Ollama) |
| **Vision** | Mistral Small | Gemini 2.0 Flash (Free) |
| **Raisonnement** | GPT OSS 120B | Claude 3.5 Haiku |
| **Production haute charge** | Gemini 2.5 Flash Lite | Ministral 8B |
| **Budget limité** | Step 1 Flash (Free) | Llama 3.1 (Ollama) |
| **Confidentialité** | Llama 3.1 (Ollama) | Gemma 2 9B (Ollama) |

### Optimisation des coûts

1. **Utilisez les modèles gratuits** pour le développement et les tests
2. **Configurez un modèle par défaut économique** (ex: Ministral 8B)
3. **Réservez les modèles premium** pour les tâches complexes
4. **Implémentez du caching** pour les réponses fréquentes
5. **Utilisez Ollama en local** pour les environnements de dev

### Gestion des fallbacks

Le AI Gateway gère automatiquement les fallbacks, mais vous pouvez aussi implémenter votre propre logique :

```typescript
async function generateWithFallback(prompt: string) {
  try {
    // Tenter le modèle principal
    return await generateText({ model: primaryModel, prompt });
  } catch (error) {
    // Fallback sur un modèle secondaire
    return await generateText({ model: backupModel, prompt });
  }
}
```

### Monitoring et limites

Surveillez l'utilisation via :
- Dashboard Vercel AI Gateway
- Logs d'application
- Système de quotas intégré (voir [subscription.md](subscription.md))

---

## Dépannage

### Erreur: "Model not found"

**Causes possibles** :
1. Le modèle n'est pas configuré dans `lib/ai/models.ts`
2. La clé API du provider est manquante
3. Le provider est indisponible

**Solutions** :
```bash
# Vérifiez que le modèle est dans la liste
grep "model-id" lib/ai/models.ts

# Testez la connexion au provider
curl -H "Authorization: Bearer $API_KEY" \
  https://api.provider.com/v1/models
```

### Erreur: "Rate limit exceeded"

**Solutions** :
1. Passez à un modèle avec des limites plus élevées
2. Implémentez un système de queue
3. Utilisez plusieurs clés API (rotation)
4. Activez le mode gratuit OpenRouter pour les tests

### Ollama ne répond pas

```bash
# Redémarrez Ollama
ollama serve

# Vérifiez les logs
journalctl -u ollama

# Testez un modèle
ollama run llama3.1 "Hello"
```

---

## Ressources supplémentaires

- [Vercel AI Gateway Docs](https://vercel.com/docs/ai-gateway)
- [AI SDK Providers](https://ai-sdk.dev/providers/ai-sdk-providers)
- [OpenRouter Models](https://openrouter.ai/models)
- [Ollama Library](https://ollama.com/library)
- [Cerebras Cloud Docs](https://docs.cerebras.ai)
- [Mistral AI Platform](https://console.mistral.ai)

---

<p align="center">
  <a href="/docs/README.md">← Retour à la documentation</a> • 
  <a href="/docs/configuration.md">Configuration →</a>
</p>
