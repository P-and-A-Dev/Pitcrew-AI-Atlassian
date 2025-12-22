# Architecture - PitCrew AI

Documentation technique de l'architecture avec diagrammes Mermaid.

---

## 🏗️ Architecture Globale

```mermaid
graph TB
    subgraph "Bitbucket Cloud"
        BB[Bitbucket Webhook<br/>PR Events]
    end

    subgraph "Forge Runtime"
        WH[pr-webhook.ts<br/>Event Handler]
        
        subgraph "Core Services"
            PS[PR Storage<br/>Service]
            BC[Bitbucket<br/>Comments]
            ST[Storage<br/>Service]
        end
        
        subgraph "Analysis Engine"
            DA[Diff Analyzer<br/>File Categories]
            PA[Process Analyzer<br/>Timing/Reviewers]
            RS[Risk Scoring<br/>Algorithm]
        end
        
        subgraph "Infrastructure"
            LOG[Logger<br/>JSON Structured]
            CACHE[Cache<br/>TTL 5min]
            RETRY[Safe Forge Call<br/>Retry + Timeout]
        end
        
        subgraph "Forge Storage"
            KV[(Key-Value<br/>Storage)]
        end
    end

    BB -->|webhook| WH
    WH -->|validate| WH
    WH -->|fetch diff| RETRY
    RETRY -->|API call| BB
    RETRY -->|check cache| CACHE
    
    WH -->|analyze files| DA
    WH -->|check timing| PA
    WH -->|calculate risk| RS
    
    DA --> RS
    PA --> RS
    
    WH -->|save PR| PS
    WH -->|post comment| BC
    WH -->|save state| ST
    
    PS --> KV
    BC -->|API call| RETRY
    ST --> KV
    
    WH -.->|log events| LOG
    PS -.->|log ops| LOG
    BC -.->|log ops| LOG
    RETRY -.->|log retries| LOG

    style WH fill:#4CAF50
    style RS fill:#FF9800
    style LOG fill:#2196F3
    style CACHE fill:#9C27B0
```

---

## 🔄 Séquence Webhook PR

```mermaid
sequenceDiagram
    participant BB as Bitbucket
    participant WH as pr-webhook
    participant CACHE as diffCache
    participant API as Bitbucket API
    participant DA as DiffAnalyzer
    participant RS as RiskScoring
    participant PS as PrStorage
    participant BC as Comments
    participant LOG as Logger

    BB->>WH: PR Updated Event
    activate WH
    
    WH->>LOG: Create logger(prId, repoUuid)
    WH->>WH: validateWebhookPayload()
    
    alt Invalid payload
        WH->>LOG: error("Validation failed")
        WH-->>BB: Return early
    end
    
    WH->>WH: Check PR state
    
    alt PR Closed (merged/declined)
        WH->>PS: deletePullRequest()
        WH->>LOG: info("PR closed")
        WH-->>BB: Done
    end
    
    WH->>PS: Get last analysis state
    PS-->>WH: lastSourceCommitHash
    
    alt Commit unchanged (Smart Gating)
        WH->>LOG: info("Skip analysis, commit unchanged")
        WH-->>BB: Done
    end
    
    WH->>LOG: info("Analysis started")
    
    WH->>CACHE: diffCache.get(cacheKey)
    
    alt Cache HIT
        CACHE-->>WH: Cached diff data
        WH->>LOG: info("Cache hit")
    else Cache MISS
        WH->>API: safeForgeCall(fetchPrDiffStat)
        
        loop Retry up to 3 times
            API->>API: Attempt API call
            alt Success
                API-->>WH: Diff stats
            else Retryable error
                API->>API: Wait (exponential backoff)
            else Non-retryable
                API-->>WH: null
            end
        end
        
        WH->>CACHE: diffCache.set(cacheKey, result)
        WH->>LOG: info("Cache miss, fetched")
    end
    
    WH->>DA: analyzeFiles(modifiedFiles)
    DA-->>WH: metrics (critical, tests, etc)
    
    WH->>RS: calculateRisk(pr, metrics, timing)
    RS-->>WH: risk (score, color, factors)
    
    WH->>LOG: info("Analysis complete", metrics)
    
    WH->>PS: saveOrUpdatePullRequest(pr)
    PS->>PS: Update indexes (byRisk, open, etc)
    PS->>LOG: info("PR saved")
    
    WH->>WH: Check comment fingerprint
    
    alt Fingerprint changed
        WH->>BC: updatePullRequestComment()
        BC->>API: PUT /comments/{id}
        
        alt Comment not found (404)
            BC->>LOG: warn("Comment not found")
            BC->>API: POST /comments (create new)
        end
        
        BC->>LOG: info("Comment updated")
    else Fingerprint unchanged
        WH->>LOG: info("Skip comment update")
    end
    
    WH->>LOG: Final PR state logged
    
    deactivate WH
    WH-->>BB: Success
```

---

## 🔄 Retry Logic avec Cache

```mermaid
graph TD
    Start([API Call Request]) --> CheckCache{Cache exists?}
    
    CheckCache -->|Yes| CacheHit[Return cached data]
    CheckCache -->|No| Attempt1[Attempt 1: API Call]
    
    Attempt1 --> Check1{Success?}
    Check1 -->|Yes| Cache1[Cache result<br/>TTL 5min]
    Cache1 --> Return1[Return data]
    
    Check1 -->|No| Retryable1{Retryable<br/>error?}
    Retryable1 -->|No| Fail[Return null]
    Retryable1 -->|Yes| Backoff1[Wait 1s<br/>+ jitter]
    
    Backoff1 --> Attempt2[Attempt 2: API Call]
    Attempt2 --> Check2{Success?}
    Check2 -->|Yes| Cache2[Cache result]
    Cache2 --> Return2[Return data]
    
    Check2 -->|No| Retryable2{Retryable?}
    Retryable2 -->|No| Fail
    Retryable2 -->|Yes| Backoff2[Wait 2s<br/>+ jitter]
    
    Backoff2 --> Attempt3[Attempt 3: API Call]
    Attempt3 --> Check3{Success?}
    Check3 -->|Yes| Cache3[Cache result]
    Cache3 --> Return3[Return data]
    
    Check3 -->|No| Retryable3{Retryable?}
    Retryable3 -->|No| Fail
    Retryable3 -->|Yes| Backoff3[Wait 4s<br/>+ jitter]
    
    Backoff3 --> Attempt4[Attempt 4: Final]
    Attempt4 --> Check4{Success?}
    Check4 -->|Yes| Cache4[Cache result]
    Cache4 --> Return4[Return data]
    Check4 -->|No| Fail
    
    CacheHit --> End([Complete])
    Return1 --> End
    Return2 --> End
    Return3 --> End
    Return4 --> End
    Fail --> End
    
    style CacheHit fill:#4CAF50
    style Cache1 fill:#4CAF50
    style Cache2 fill:#4CAF50
    style Cache3 fill:#4CAF50
    style Cache4 fill:#4CAF50
    style Fail fill:#f44336
```

---

## 📊 Storage Architecture

```mermaid
graph LR
    subgraph "Forge Storage (KV)"
        PR1[pr:ws:repo:123]
        PR2[pr:ws:repo:456]
        
        IDX_OPEN[index:open:ws:repo]
        IDX_RED[index:byRisk:ws:repo:red]
        IDX_YELLOW[index:byRisk:ws:repo:yellow]
        IDX_GREEN[index:byRisk:ws:repo:green]
        
        STATE1[pr-analysis:repo:123]
        STATE2[pr-analysis:repo:456]
    end
    
    subgraph "Indexes"
        IDX_OPEN -.->|"['pr:ws:repo:123',<br/>'pr:ws:repo:456']"| PR1
        IDX_OPEN -.-> PR2
        
        IDX_RED -.->|"['pr:ws:repo:789']"| PR3[pr:ws:repo:789]
        IDX_YELLOW -.-> PR1
        IDX_GREEN -.-> PR2
    end
    
    subgraph "Analysis State"
        STATE1 -.->|lastCommitHash| PR1
        STATE2 -.->|lastCommitHash| PR2
    end
    
    style PR1 fill:#FFC107
    style PR2 fill:#4CAF50
    style PR3 fill:#f44336
```

---

## 🎯 Risk Scoring Flow

```mermaid
graph TD
    Start([PR Data]) --> Base[Base Score: 100]
    
    Base --> CheckDocs{Docs-only<br/>PR?}
    CheckDocs -->|Yes| DocsCap[Cap at 20]
    CheckDocs -->|No| CheckSize{PR Size}
    
    CheckSize -->|Small<br/>≤50 lines| Small[-10]
    CheckSize -->|Medium<br/>≤200| Medium[+0]
    CheckSize -->|Large<br/>≤500| Large[+10]
    CheckSize -->|XL<br/>>500| XL[+20]
    
    Small --> CheckCritical
    Medium --> CheckCritical
    Large --> CheckCritical
    XL --> CheckCritical
    
    CheckCritical{Critical<br/>files?}
    CheckCritical -->|Yes| CritPenalty[-30 per file]
    CheckCritical -->|No| CheckTests
    
    CritPenalty --> CheckTests{Tests<br/>present?}
    CheckTests -->|No| NoTests[-20]
    CheckTests -->|Yes| CheckReviewers
    
    NoTests --> CheckReviewers{Has<br/>reviewers?}
    CheckReviewers -->|No + age>2h| NoRev[-15]
    CheckReviewers -->|Yes| CheckOffHours
    
    NoRev --> CheckOffHours{Off-hours<br/>commit?}
    CheckOffHours -->|Yes| OffHours[-10]
    CheckOffHours -->|No| CheckTestsOnly
    
    OffHours --> CheckTestsOnly{Tests-only<br/>PR?}
    CheckTestsOnly -->|Yes| TestBonus[+20 bonus]
    CheckTestsOnly -->|No| VerySmall
    
    TestBonus --> VerySmall{Very small<br/>&&lt;20 lines?}
    VerySmall -->|Yes| YellowFloor[Floor: 60]
    VerySmall -->|No| Final
    
    DocsCap --> Final
    YellowFloor --> Final
    
    Final([Final Score]) --> Color{Score<br/>range}
    Color -->|≥80| Green[Green]
    Color -->|50-79| Yellow[Yellow]
    Color -->|&lt;50| Red[Red]
    
    style Green fill:#4CAF50
    style Yellow fill:#FFC107
    style Red fill:#f44336
```

---

## 📝 Composants Clés

### Webhook Handler
- **Fichier:** `pr-webhook.ts`
- **Rôle:** Point d'entrée, orchestration
- **Responsabilités:**
  - Validation payload
  - Smart gating (skip si commit inchangé)
  - Orchestration analyse
  - Gestion commentaires

### Services
- **PR Storage:** CRUD PRs + indexes (risk, open, repo)
- **Bitbucket Comments:** Create/update comments API
- **Storage:** Analysis state (commits hash tracking)

### Analyseurs
- **Diff Analyzer:** Catégorise fichiers (critical, tests, docs, etc.)
- **Process Analyzer:** Timing (off-hours), reviewers
- **Risk Scoring:** Algorithme de score avec pénalités/bonus

### Infrastructure
- **Logger:** JSON structuré avec contexte
- **Cache:** TTL 5min pour diffs
- **Retry:** Exponential backoff + jitter

---

## 🔐 Sécurité

Voir [SECURITY.md](file:///d:/Documents/Development/Projects/Hackathons%20Projects/Pitcrew-AI-Atlassian/apps/forge-bitbucket/SECURITY.md) pour détails complets.

**Scopes:**
- `storage:app` - Persistence
- `read:pullrequest:bitbucket` - Diff stats
- `write:comment:bitbucket` - Post comments

**Données:** Aucune PII, seulement metadata PR
