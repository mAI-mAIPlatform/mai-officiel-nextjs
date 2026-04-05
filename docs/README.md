# Documentation mAI Chatbot

Bienvenue dans la documentation complète de mAI Chatbot. Ce document sert de point d'entrée vers tous les guides et références du projet.

## 📚 Table des matières

### Guides de démarrage

- **[README.md](/README.md)** - Vue d'ensemble, installation rapide et fonctionnalités principales
- **[Configuration](configuration.md)** - Guide détaillé de configuration des variables d'environnement
- **[Déploiement](deployment.md)** - Déployer votre application en production

### Documentation technique

- **[Architecture](architecture.md)** - Architecture technique et organisation du code
- **[Base de données](database.md)** - Schéma de base de données et migrations
- **[API](api.md)** - Référence complète des endpoints API

### Fonctionnalités

- **[Modèles IA](models.md)** - Configuration et utilisation des modèles de langage
- **[Système d'abonnement](subscription.md)** - Gestion des plans et quotas utilisateurs
- **[Tests](testing.md)** - Exécuter et écrire des tests

---

## 🚀 Démarrage rapide

### Installation en 5 minutes

```bash
# 1. Cloner le repository
git clone https://github.com/votre-org/chatbot.git
cd chatbot

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Éditez .env.local avec vos clés API

# 4. Initialiser la base de données
pnpm db:generate
pnpm db:migrate

# 5. Lancer le serveur
pnpm dev
```

L'application est maintenant accessible sur [http://localhost:3000](http://localhost:3000).

---

## 📖 Par où commencer ?

### Pour les nouveaux utilisateurs

1. Lisez le [README principal](/README.md) pour une vue d'ensemble
2. Suivez le guide de [Configuration](configuration.md)
3. Explorez les [Modèles IA disponibles](models.md)
4. Consultez le système d'[Abonnement](subscription.md)

### Pour les développeurs

1. Étudiez l'[Architecture](architecture.md) du projet
2. Familiarisez-vous avec le schéma de [Base de données](database.md)
3. Explorez la référence [API](api.md)
4. Lisez le guide de [Tests](testing.md)

### Pour le déploiement

1. Suivez le guide de [Déploiement](deployment.md)
2. Configurez vos variables d'environnement en production
3. Déployez sur Vercel ou votre plateforme préférée

---

## 🛠️ Ressources supplémentaires

### Liens externes

- [Next.js Documentation](https://nextjs.org/docs)
- [AI SDK Documentation](https://ai-sdk.dev/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
- [shadcn/ui](https://ui.shadcn.com)

### Support

- 📧 Issues GitHub pour les bugs et feature requests
- 💬 Discussions GitHub pour les questions générales

---

## 📝 Structure de la documentation

```
docs/
├── README.md              # Ce fichier - Index de la documentation
├── configuration.md       # Configuration des variables d'environnement
├── architecture.md        # Architecture technique
├── database.md            # Schéma et migrations de base de données
├── api.md                 # Référence API complète
├── models.md              # Guide des modèles IA
├── subscription.md        # Système d'abonnement et quotas
├── deployment.md          # Guide de déploiement
└── testing.md             # Tests et qualité du code
```

---

## 🤝 Contribuer à la documentation

Les améliorations de la documentation sont les bienvenues ! Pour contribuer :

1. Forker le repository
2. Modifier les fichiers `.md` dans `/docs`
3. Soumettre une Pull Request

Assurez-vous que :
- Le contenu est clair et précis
- Les exemples de code sont testés
- La mise en forme Markdown est correcte

---

<p align="center">
  Documentation mAI Chatbot • Construit avec ❤️
</p>
