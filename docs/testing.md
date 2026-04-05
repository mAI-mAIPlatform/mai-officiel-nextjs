# Tests

Guide complet pour écrire, exécuter et maintenir les tests dans mAI Chatbot.

## 📋 Sommaire

- [Vue d'ensemble](#vue-densemble)
- [Configuration](#configuration)
- [Tests E2E avec Playwright](#tests-e2e-avec-playwright)
- [Écrire des tests](#écrire-des-tests)
- [Bonnes pratiques](#bonnes-pratiques)
- [CI/CD](#cicd)
- [Dépannage](#dépannage)

---

## Vue d'ensemble

mAI Chatbot utilise **Playwright** pour les tests end-to-end (E2E), permettant de tester l'application complète dans un navigateur réel.

### Stack de test

| Outil | Version | Usage |
|-------|---------|-------|
| **Playwright** | 1.53.0 | Tests E2E |
| **@playwright/test** | 1.53.0 | Test runner |
| **TypeScript** | 5.6.3 | Typage des tests |

### Types de tests

1. **Tests E2E** : Scénarios complets utilisateur
2. **Tests d'API** : Endpoints backend
3. **Tests de composants** : (optionnel, avec Vitest)

---

## Configuration

### Installation

```bash
pnpm install -D @playwright/test
pnpm exec playwright install
```

### Fichier de configuration

`playwright.config.ts` :

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Tests E2E avec Playwright

### Structure des tests

```
tests/
├── e2e/                    # Tests end-to-end
│   ├── chat.test.ts        # Tests de conversation
│   ├── auth.test.ts        # Tests d'authentification
│   ├── api.test.ts         # Tests d'API
│   └── model-selector.test.ts
├── pages/                  # Page objects
│   ├── base.page.ts
│   ├── chat.page.ts
│   └── login.page.ts
├── fixtures.ts             # Fixtures partagées
└── helpers.ts              # Fonctions utilitaires
```

### Exemple de test simple

`tests/e2e/example.test.ts` :

```typescript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  
  // Vérifier le titre
  await expect(page).toHaveTitle(/mAI Chatbot/);
  
  // Vérifier qu'un élément est visible
  const chatInput = page.getByPlaceholder(/Envoyer un message/);
  await expect(chatInput).toBeVisible();
});
```

---

## Écrire des tests

### Test d'authentification

`tests/e2e/auth.test.ts` :

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register a new user', async ({ page }) => {
    // Naviguer vers la page d'inscription
    await page.goto('/register');
    
    // Remplir le formulaire
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Name').fill('Test User');
    
    // Soumettre
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Attendre la redirection
    await expect(page).toHaveURL('/chat');
    
    // Vérifier que l'utilisateur est connecté
    const userMenu = page.getByTestId('user-menu');
    await expect(userMenu).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('existing@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page).toHaveURL('/chat');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Vérifier le message d'erreur
    const errorMessage = page.getByText('Invalid credentials');
    await expect(errorMessage).toBeVisible();
  });
});
```

### Test de conversation

`tests/e2e/chat.test.ts` :

```typescript
import { test, expect } from '@playwright/test';

test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter avant chaque test
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/chat');
  });

  test('should send a message and receive response', async ({ page }) => {
    // Attendre que l'input soit prêt
    const chatInput = page.getByPlaceholder(/Envoyer un message/);
    await expect(chatInput).toBeVisible();
    
    // Envoyer un message
    await chatInput.fill('Bonjour !');
    await page.keyboard.press('Enter');
    
    // Vérifier que le message utilisateur apparaît
    const userMessage = page.getByText('Bonjour !');
    await expect(userMessage).toBeVisible();
    
    // Attendre la réponse IA (peut prendre du temps)
    const assistantMessage = page.locator('[data-role="assistant"]').first();
    await expect(assistantMessage).toBeVisible({ timeout: 30000 });
  });

  test('should create a new chat', async ({ page }) => {
    // Cliquer sur "Nouveau chat"
    await page.getByRole('button', { name: /nouveau chat/i }).click();
    
    // Vérifier qu'un nouveau chat est créé
    await expect(page).toHaveURL(/\/chat\/[a-f0-9-]+/);
  });

  test('should list chat history', async ({ page }) => {
    // Ouvrir la sidebar
    await page.getByTestId('sidebar-toggle').click();
    
    // Vérifier que l'historique est visible
    const chatHistory = page.getByTestId('chat-history');
    await expect(chatHistory).toBeVisible();
  });
});
```

### Test de sélection de modèle

`tests/e2e/model-selector.test.ts` :

```typescript
import { test, expect } from '@playwright/test';

test.describe('Model Selector', () => {
  test('should display available models', async ({ page }) => {
    await page.goto('/chat');
    
    // Ouvrir le sélecteur de modèle
    await page.getByTestId('model-selector').click();
    
    // Vérifier que les modèles sont listés
    const modelList = page.getByRole('listbox');
    await expect(modelList).toBeVisible();
    
    // Vérifier quelques modèles
    await expect(page.getByText('Kimi K2 0905')).toBeVisible();
    await expect(page.getByText('DeepSeek V3.2')).toBeVisible();
  });

  test('should change model selection', async ({ page }) => {
    await page.goto('/chat');
    
    // Sélectionner un modèle différent
    await page.getByTestId('model-selector').click();
    await page.getByText('Mistral Codestral').click();
    
    // Vérifier que le modèle est mis à jour
    const selectedModel = page.getByTestId('selected-model');
    await expect(selectedModel).toContainText('Codestral');
  });
});
```

### Test d'API

`tests/e2e/api.test.ts` :

```typescript
import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('GET /api/models should return model list', async ({ request }) => {
    const response = await request.get('/api/models');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(Array.isArray(data.data.models)).toBeTruthy();
    expect(data.data.models.length).toBeGreaterThan(0);
  });

  test('GET /api/chat should require authentication', async ({ request }) => {
    const response = await request.get('/api/chat');
    
    // Devrait retourner une erreur 401 ou rediriger
    expect(response.status()).toBeGreaterThanOrEqual(300);
  });

  test('POST /api/files/upload should reject large files', async ({ request }) => {
    // Créer un fichier trop volumineux (> limite Free)
    const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB
    
    const formData = new FormData();
    formData.append('file', new Blob([largeFile]), 'large.txt');
    
    const response = await request.post('/api/files/upload', {
      multipart: formData,
    });
    
    // Devrait échouer pour un utilisateur Free
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
```

---

## Page Objects

Pattern recommandé pour organiser les tests.

`tests/pages/base.page.ts` :

```typescript
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userMenu = page.getByTestId('user-menu');
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  async isLoggedIn(): Promise<boolean> {
    return this.userMenu.isVisible();
  }
}
```

`tests/pages/login.page.ts` :

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.getByText(/invalid credentials/i);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return this.errorMessage.textContent() || '';
  }
}
```

`tests/pages/chat.page.ts` :

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ChatPage extends BasePage {
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly messages: Locator;
  readonly modelSelector: Locator;

  constructor(page: Page) {
    super(page);
    this.chatInput = page.getByPlaceholder(/envoyer un message/i);
    this.sendButton = page.getByRole('button', { name: /send/i });
    this.messages = page.locator('[data-message]');
    this.modelSelector = page.getByTestId('model-selector');
  }

  async sendMessage(content: string) {
    await this.chatInput.fill(content);
    await this.sendButton.click();
  }

  async getLastMessage(): Promise<string> {
    const lastMessage = this.messages.last();
    return lastMessage.textContent() || '';
  }

  async waitForAssistantResponse(timeout = 30000) {
    const assistantMessage = this.page.locator('[data-role="assistant"]').first();
    await assistantMessage.waitFor({ state: 'visible', timeout });
  }
}
```

### Utilisation dans les tests

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ChatPage } from '../pages/chat.page';

test.describe('User Flow', () => {
  test('complete chat flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const chatPage = new ChatPage(page);
    
    // Login
    await loginPage.goto('/login');
    await loginPage.login('test@example.com', 'password123');
    await expect(loginPage).toHaveURL(/\/chat/);
    
    // Send message
    await chatPage.sendMessage('Bonjour !');
    await chatPage.waitForAssistantResponse();
    
    const response = await chatPage.getLastMessage();
    expect(response).toBeTruthy();
  });
});
```

---

## Bonnes pratiques

### 1. Isolation des tests

Chaque test doit être indépendant :

```typescript
test.beforeEach(async ({ page }) => {
  // Reset état avant chaque test
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});
```

### 2. Selecteurs robustes

Privilégiez les `data-testid` aux sélecteurs CSS fragiles :

```tsx
// Dans vos composants React
<div data-testid="chat-input">
  <input placeholder="Envoyer un message" />
</div>
```

```typescript
// Dans vos tests
const chatInput = page.getByTestId('chat-input');
```

### 3. Attentes explicites

Évitez `waitForTimeout`, préférez les attentes conditionnelles :

```typescript
// ❌ Mauvais
await page.waitForTimeout(5000);

// ✅ Bon
await expect(page.getByText('Succès')).toBeVisible({ timeout: 5000 });
```

### 4. Données de test

Utilisez des données uniques pour éviter les conflits :

```typescript
const uniqueEmail = `test+${Date.now()}@example.com`;
```

### 5. Screenshots et vidéos

Capturez automatiquement en cas d'échec :

```typescript
// playwright.config.ts
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
},
```

---

## CI/CD

### GitHub Actions

`.github/workflows/tests.yml` :

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          AUTH_SECRET: test-secret-for-ci
          BLOB_READ_WRITE_TOKEN: test-blob-token
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Scripts package.json

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report"
  }
}
```

---

## Dépannage

### Test échoue aléatoirement

**Cause** : Timing ou état non déterministe.

**Solutions** :
1. Augmenter les timeouts
2. Ajouter des attentes explicites
3. Utiliser `test.retry(2)`

```typescript
test('flaky test', async ({ page }) => {
  test.retry(2); // Réessayer 2 fois en cas d'échec
  
  // ... test code
});
```

### Timeout trop court

**Solution** : Ajuster le timeout global ou par test

```typescript
// playwright.config.ts
timeout: 60000, // Global timeout

// Ou par test
test('slow test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  // ...
});
```

### Navigateur ne démarre pas

**Cause** : Dépendances manquantes en CI.

**Solution** :
```bash
pnpm exec playwright install --with-deps
```

### Erreur d'authentification en test

**Solution** : Utiliser un état authentifié pré-généré :

```typescript
// tests/fixtures/authenticated.ts
import { test as base } from '@playwright/test';

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login programmatically
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/chat');
    
    // Save auth state
    await context.storageState({ path: 'auth-state.json' });
    
    await use(page);
  },
});
```

---

## Ressources supplémentaires

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library](https://testing-library.com)

---

<p align="center">
  <a href="/docs/README.md">← Retour à la documentation</a> • 
  <a href="/docs/architecture.md">Architecture →</a>
</p>
