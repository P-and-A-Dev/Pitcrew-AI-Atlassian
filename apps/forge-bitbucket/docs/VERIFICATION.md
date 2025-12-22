# Checklist de Vérification - PR Storage System

## 1. Vérification Statique (Code Quality)

### Lint Check
```bash
cd apps/forge-bitbucket
forge lint
```
**Attendu**: `No issues found.`

---

## 2. Vérification des Fichiers Créés

### Structure attendue
```
src/
├── models/
│   ├── internal-pr.ts          ✓ (existant)
│   └── stored-pr.ts            ✓ NOUVEAU
├── services/
│   ├── pr-storage.service.ts   ✓ NOUVEAU
│   └── ...
├── tests/
│   └── pr-storage.test.ts      ✓ NOUVEAU
└── pr-webhook.ts               ✓ MODIFIÉ

docs/
└── PR-STORAGE.md               ✓ NOUVEAU
```

### Commande de vérification
```bash
# Check files exist
ls src/models/stored-pr.ts
ls src/services/pr-storage.service.ts
ls src/tests/pr-storage.test.ts
ls docs/PR-STORAGE.md
```

---

## 3. Vérification du Code

### A. Vérifier les imports dans pr-webhook.ts

Ouvrir `src/pr-webhook.ts` et chercher :
```typescript
import { prStorageService } from "./services/pr-storage.service";
```

Chercher les appels (2 endroits) :
```typescript
// 1. Après analyse (ligne ~80)
await prStorageService.saveOrUpdatePullRequest(pr);

// 2. Sur PR close (ligne ~20)
await prStorageService.saveOrUpdatePullRequest(pr);
```

### B. Vérifier stored-pr.ts

Ouvrir `src/models/stored-pr.ts` et vérifier :
- ✓ Type `StoredPullRequest` existe
- ✓ Function `buildPrKey()` existe
- ✓ Function `buildIndexKey()` existe

### C. Vérifier pr-storage.service.ts

Ouvrir `src/services/pr-storage.service.ts` et vérifier :
- ✓ Classe `PrStorageService` existe
- ✓ Méthode `saveOrUpdatePullRequest()` existe
- ✓ Méthode `getTelemetryCounts()` existe
- ✓ Méthode `getHighRiskPrs()` existe
- ✓ Export `export const prStorageService = new PrStorageService()`

---

## 4. Déploiement et Test en Conditions Réelles

### Étape 1: Déployer l'app
```bash
cd apps/forge-bitbucket
forge deploy --non-interactive -e development
```

**Attendu**: Déploiement successful

### Étape 2: Vérifier que l'app est installée
```bash
forge install --list
```

**Attendu**: Voir ton app `forge-bitbucket` dans la liste

### Étape 3: Déclencher un webhook (créer ou update un PR sur Bitbucket)

1. Va sur ton repo Bitbucket
2. Crée ou modifie un Pull Request
3. Attends quelques secondes

### Étape 4: Vérifier les logs
```bash
forge logs -e development --since 5m
```

**Logs attendus** (dans l'ordre) :
```
🚀 [ANALYSIS START] PR #123 changed...
✅ Diff fetched & Analyzed: X files...
🎯 Risk Score: XX (yellow)
💾 [STORAGE] Saving PR PR:workspace-xxx:repo-xxx:123
✅ [STORAGE] Saved PR PR:workspace-xxx:repo-xxx:123 | State: OPEN | Risk: yellow (XX)
```

---

## 5. Vérification du Storage (via Forge tunnel)

### Option A: Créer un endpoint de test

Ajouter temporairement dans `manifest.yml` :
```yaml
function:
  - key: test-storage
    handler: test-handler.testStorage

webtrigger:
  - key: test-trigger
    function: test-storage
```

Créer `src/test-handler.ts` :
```typescript
import { prStorageService } from "./services/pr-storage.service";

export async function testStorage() {
  const counts = await prStorageService.getTelemetryCounts(
    "workspace-uuid-here",
    "repo-uuid-here"
  );
  
  return {
    statusCode: 200,
    body: JSON.stringify(counts, null, 2)
  };
}
```

Puis:
```bash
forge deploy
forge webtrigger --list
curl <webtrigger-url>
```

**Attendu**: JSON avec counts
```json
{
  "total": 5,
  "open": 3,
  "red": 1,
  "yellow": 2,
  "green": 0
}
```

---

## 6. Test Manuel du Storage (via Forge console)

### Dans un fichier temporaire de test

Créer `src/manual-test.ts` :
```typescript
import { prStorageService } from "./services/pr-storage.service";

async function manualTest() {
  // Get counts
  const counts = await prStorageService.getTelemetryCounts(
    "your-workspace-uuid",
    "your-repo-uuid"
  );
  console.log("Counts:", counts);

  // Get high-risk PRs
  const redPrs = await prStorageService.getHighRiskPrs(
    "your-workspace-uuid",
    "your-repo-uuid"
  );
  console.log("High-risk PRs:", redPrs.length);

  // Get a specific PR
  const pr = await prStorageService.getPullRequest(
    "your-workspace-uuid",
    "your-repo-uuid",
    1 // PR number
  );
  console.log("PR #1:", pr?.title);
}
```

---

## 7. Checklist Rapide ✅

Coche au fur et à mesure :

- [ ] `forge lint` → No issues found
- [ ] Fichiers créés : `stored-pr.ts`, `pr-storage.service.ts`, `pr-storage.test.ts`
- [ ] `pr-webhook.ts` a l'import `prStorageService`
- [ ] `pr-webhook.ts` appelle `saveOrUpdatePullRequest()` (2 fois)
- [ ] `forge deploy` → Success
- [ ] Créer/modifier un PR sur Bitbucket
- [ ] `forge logs` → Voir `💾 [STORAGE] Saving PR...`
- [ ] `forge logs` → Voir `✅ [STORAGE] Saved PR...`
- [ ] (Optionnel) Test storage via webtrigger → Retourne counts

---

## 8. Indicateurs de Succès

### ✅ Storage fonctionne si :
1. Logs montrent `💾 [STORAGE] Saving PR...`
2. Logs montrent `✅ [STORAGE] Saved PR...` sans erreur
3. Logs montrent le state et risk color correct
4. Si tu changes le risk d'un PR, logs montrent `🎨 [STORAGE] Risk color changed: X → Y`

### ❌ Problèmes potentiels :
- **Erreur "storage is not defined"** → Permissions manquantes dans manifest.yml (besoin de `storage:app`)
- **Pas de logs `[STORAGE]`** → `saveOrUpdatePullRequest()` pas appelé dans webhook
- **Erreur TypeScript** → Relancer `forge lint`

---

## 9. Test de Non-Régression

### Vérifier que l'analyse normale fonctionne toujours :

Créer un PR et vérifier dans les logs :
```
✅ Diff fetched & Analyzed: X files...
🎯 Risk Score: XX (color)
   Factors: ...
```

Si ces logs apparaissent → Le risk scoring n'est PAS cassé ✅

---

## 10. Validation Finale

### Le système est OK si TOUS ces points sont vrais :

1. ✅ `forge lint` passe
2. ✅ `forge deploy` passe
3. ✅ Logs montrent `[STORAGE]` après analyse PR
4. ✅ Pas d'erreur `❌ [STORAGE] Failed...`
5. ✅ Risk scoring logs toujours présents

---

## Pro Tip 💡

Pour voir en temps réel :
```bash
# Terminal 1: Logs en live
forge logs -e development --tail

# Terminal 2: Tunnel pour dev
forge tunnel -e development

# Puis modifier un PR sur Bitbucket et observer les logs
```

**Tu devrais voir** les logs défiler en temps réel avec toutes les étapes d'analyse + storage !
