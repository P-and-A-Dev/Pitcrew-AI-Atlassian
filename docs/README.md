# 🏎️ **PitCrew AI for Atlassian**

**Formula 1-inspired Engineering Telemetry for Jira & Bitbucket**

PitCrew AI transforms Jira and Bitbucket into an F1-style telemetry system for engineering teams.  
It analyzes pull requests in real time, detects risks, and displays engineering metrics inside a Williams-themed dashboard.

Designed for **Codegeist 2025: Williams Racing Edition**.

---

## 🚀 **What is PitCrew AI?**

PitCrew AI acts like a Formula 1 pit crew for your development workflow:

* Measures the "risk level" of each PR using a sophisticated scoring algorithm
* Detects critical files, missing tests, and off-hours commits
* Posts automated risk analysis comments in Bitbucket
* Displays all engineering telemetry inside a Williams F1-themed dashboard
* (Planned) Calls Rovo to summarize PRs and highlight reviewer focus points
* (Planned) Generates weekly "Race Report" summarizing team performance

This provides technical clarity and keeps teams flowing like a perfectly timed pit stop.

---

## ✅ **What is Implemented**

PitCrew AI currently delivers a **production-grade PR risk analysis system**:

* **Real-time PR Analysis** – Webhooks trigger instant analysis on every PR update (create, update, merge, decline)
* **Intelligent Risk Scoring** – Sophisticated algorithm (0-100 score) with 3-tier classification (🟢 Green, 🟡 Yellow, 🔴 Red) based on files changed, lines modified, test coverage, reviewers, and timing
* **Smart Gating** – Skip redundant analyses when commits haven't changed, with intelligent caching (5min TTL)
* **Automated Bitbucket Comments** – In-place comment updates with risk breakdown, metrics, and actionable factors
* **Williams F1 Dashboard** – Full React telemetry dashboard (7 views, 26+ components, Tailwind v4) with KPIs, charts, and PR timeline
* **Robust Infrastructure** – Retry logic with exponential backoff, structured JSON logging, Zod validation, and comprehensive error handling
* **Security-First Design** – Least-privilege scopes, no PII storage, GDPR-compliant, full threat model documented

---

## 🚧 **What is Planned**

**Next phase for Codegeist 2025:**

* **Rovo Agents** – AI-powered PR summaries and smart reviewer recommendations
* **Weekly Race Report** – Automated F1-style team performance reports with podiums, trends, and insights
* **Jira Deep Integration** – Auto-flag high-risk PRs as Jira issues, custom fields, sprint board metrics
* **ML Analytics** – Predictive models for review time, bottleneck detection, and quality forecasting

---

## 🧠 **Tech Stack**

### **Frontend (Dashboard)**

* React 19.2.0
* TypeScript 5.9.3 (strict mode)
* Vite 7.2.7
* Tailwind CSS v4.1.18
* React Router 7.11.0
* Recharts 3.5.1

### **Backend / Integrations**

* Atlassian Forge (Node.js 22.x, ARM64)
* Forge Functions, Resolvers, Webhooks
* Bitbucket API integration
* Forge KV Storage

### **Infrastructure**

* Zod for validation
* Structured JSON logging
* Exponential backoff retry logic
* TTL-based caching

---

## 🏗️ **Repository Structure**

```
pitcrew-ai-atlassian/
  apps/
    forge-bitbucket/    # Backend Forge app (PR analysis, webhooks, storage)
    forge-app/          # Jira Forge app (dashboard hosting)
    dashboard/          # React dashboard (Williams F1 style, Tailwind 4)
  docs/                 # Documentation, diagrams, planning
  package.json          # NPM Workspaces config
  README.md
```

---

## 🔧 **Setup & Installation**

### 1. Clone the repository

```bash
git clone <repo-url>
cd pitcrew-ai-atlassian
npm install
```

### 2. Configure the Bitbucket Forge app

```bash
cd apps/forge-bitbucket
forge login
forge deploy
forge install
```

### 3. Configure the Jira Forge app (dashboard hosting)

```bash
cd apps/forge-app
forge deploy
forge install
```

### 4. Run the dashboard (local development)

To iterate on the UI with hot-reload (standalone mode):

```bash
npm run dev:dashboard
# Dashboard available at http://localhost:5173
```

### 5. Develop with Forge Tunnel (Integration)

To see the app inside Jira with live backend changes:

```bash
npm run dev:forge-app
```

### 6. Build & Deploy Production

To build the dashboard and deploy the full Forge app:

```bash
npm run build
```

*This command builds the dashboard (outputting to `apps/forge-app/static/dashboard`) and deploys both Forge apps.*

---

## 📊 **Risk Score Algorithm**

### Algorithm Components

**Based on 3 weighted factors:**
* **Files (40%)**: Weighted count (critical > code > docs > generated)
* **Lines (30%)**: Total lines added + removed
* **Signals (30%)**: Reviewers, tests, timing, critical files

### Score Range

* **0-100** with color classification:
  * 🟢 **Green (≥80)**: Low risk, safe to merge
  * 🟡 **Yellow (50-79)**: Medium risk, review carefully
  * 🔴 **Red (<50)**: High risk, requires thorough review

### Special Cases

* **Docs-only PR**: Capped at 20 risk (80+ score, green)
* **Tests-only PR**: +20 bonus
* **Very small PR** (<20 lines): Floor at 60 score (yellow)

### Penalties

* No reviewers (after 2h): -30%
* Critical files touched: -10% to -40% (scaled by PR size)
* No tests (with code changes): -10% to -25% (scaled)
* Off-hours commit (weekend/night): -10%

Full algorithm documentation: [`apps/forge-bitbucket/ARCHITECTURE.md`](../apps/forge-bitbucket/ARCHITECTURE.md)

---

## 🕸️ **Event Flow Architecture**

### **Bitbucket Webhook Flow**

1. PR event (created/updated/merged) → Webhook triggered
2. Smart gating checks commit hash (skip if unchanged)
3. Fetch diff statistics (with caching)
4. Analyze files (categorize: critical, tests, docs, etc.)
5. Analyze timing (off-hours detection)
6. Calculate risk score
7. Save PR to storage with indexes
8. Update/create Bitbucket comment
9. Log structured JSON

### **Storage Architecture**

* **PR Records**: `PR:{workspace}:{repo}:{prId}`
* **Indexes**:
  * `PR_INDEX:byRepo:{workspace}:{repo}` (all PRs)
  * `PR_INDEX:open:{workspace}:{repo}` (open only)
  * `PR_INDEX:byRisk:{workspace}:{repo}:{color}` (by risk color)

See full documentation: [`apps/forge-bitbucket/docs/PR-STORAGE.md`](../apps/forge-bitbucket/docs/PR-STORAGE.md)

---

## 🎨 **UI Theme: Williams F1 Inspired**

* Dark navy background (`#001F3F`)
* Cyan & white accents (`#00D9FF`, `#FFFFFF`)
* Gauge-style UI components
* Flag metaphors (green/yellow/red)
* Racing terminology ("Pit Stop", "Race Lap", "Telemetry")

---

## 🛠️ **Development Scripts**

From root:

| Command                 | Description                     |
|-------------------------|---------------------------------|
| `npm run dev:dashboard` | Run dashboard locally (port 5173) |
| `npm run dev:forge-app` | Run Forge tunnel (Jira app)     |
| `npm run build`         | Build all apps                  |
| `npm run build:dashboard` | Build dashboard only          |
| `npm run build:forge-app` | Deploy Jira Forge app         |

From `apps/forge-bitbucket`:

| Command              | Description                  |
|----------------------|------------------------------|
| `npm run build`      | Deploy Bitbucket Forge app   |
| `npm run logs`       | Tail Forge logs              |
| `npm test`           | Run Jest tests               |
| `npm run test:coverage` | Run tests with coverage   |

---

## 🧪 **Testing**

### Bitbucket Forge App (Jest)

* **Coverage target**: 60% (statements, functions, lines)
* **Tests**: Risk scoring, diff analyzer, safe-forge-call, schemas
* **Run**: `cd apps/forge-bitbucket && npm test`

### Dashboard (Vitest)

* **Coverage current**: ~5%
* **Tests**: Basic component tests (RiskBadge, PRCard, useTelemetry)
* **Run**: `cd apps/dashboard && npm test`

**Note**: Test coverage is a known gap and priority for improvement.

---

## 📚 **Documentation**

* **Main README**: Project overview
* **ARCHITECTURE.md**: Technical architecture with diagrams
* **SECURITY.md**: Security model and threat analysis
* **PR-STORAGE.md**: Storage system documentation
* **VERIFICATION.md**: Deployment verification checklist
* **AGENTS.md**: Forge development guidelines

---

## 🏁 **Project Status**

**Current State:** MVP functional, production-ready at ~70%

**Completed:**
* ✅ Real-time PR analysis with risk scoring
* ✅ Automated Bitbucket comments
* ✅ Williams F1 dashboard UI
* ✅ Robust infrastructure (retry, logging, caching)
* ✅ Security and validation

**In Progress:**
* 🚧 Dashboard integration with live data
* 🚧 Test coverage improvement

**Planned:**
* 📋 Rovo agents integration
* 📋 Weekly race reports
* 📋 Jira deep integration
* 📋 ML analytics

---

## 📜 **License**

Copyright [2025] [PGADS Tech]

Licensed under the Apache License, Version 2.0 (the "License");  
you may not use this file except in compliance with the License.  
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software  
distributed under the License is distributed on an "AS IS" BASIS,  
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  
See the License for the specific language governing permissions and  
limitations under the License.

---

## 🤝 **Contributors**

* **Antonin Do Souto** — Fullstack & AI
* **Pietro Giacomelli** — Fullstack & Atlassian integration

---

Built for **Codegeist 2025: Williams Racing Edition** 🏎️💨
