# 🏎️ **PitCrew AI for Atlassian**

**Formula 1-inspired Engineering Telemetry for Jira & Bitbucket**

PitCrew AI transforms Jira and Bitbucket into an F1-style telemetry system for engineering teams.
It analyzes pull requests in real time, detects risks, recommends reviewers, flags issues, and generates weekly race-style reports — all powered by Atlassian Forge, Rovo agents, and a fully custom React dashboard.

Designed for **Codegeist 2025: Williams Racing Edition**.

---

## 🚀 **What is PitCrew AI?**

PitCrew AI acts like a Formula 1 pit crew for your development workflow:

* Measures the “risk level” of each PR using a lightweight scoring model
* Detects critical files, missing tests, and sprint-end danger zones
* Calls Rovo to summarize PRs and highlight what reviewers should check
* Flags high-risk or blocked PRs directly in Jira & Bitbucket
* Generates a weekly “Race Report” that summarizes team performance
* Displays all engineering telemetry inside a Williams-themed dashboard

This provides technical clarity and keeps teams flowing like a perfectly timed pit stop.

---

## 🧠 **Tech Stack**

### **Frontend (Dashboard)**
* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS v4** (Williams Racing Theme)
* **Atlaskit**

### **Backend / Integrations**
* **Atlassian Forge** (Custom UI)
* **Forge Functions, Resolvers, Scheduled Triggers**
* **Rovo Agents**
* **Bitbucket & Jira Webhooks**

---

## 🏗️ **Repository Structure**

```
pitcrew-ai-atlassian/
  apps/
    forge-app/      # Backend Forge app (webhooks, resolvers, Rovo integration)
    dashboard/      # React dashboard (Williams F1 style, Tailwind 4)
  docs/             # Documentation, diagrams, planning
  package.json      # NPM Workspaces config
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

### 2. Configure the Forge app
```bash
cd apps/forge-app
forge login
forge deploy
forge install
```

### 3. Run the dashboard (local development)
To iterate on the UI with hot-reload (standalone mode):
```bash
npm run dev:dashboard
# Dashboard available at http://localhost:5173
```

### 4. Develop with Forge Tunnel (Integration)
To see the app inside Jira with live backend changes:
```bash
npm run dev:forge
```

### 5. Build & Deploy Production
To build the dashboard and deploy the full Forge app:
```bash
npm run build:forge
```
*This command runs the dashboard build (outputting to `apps/forge-app/static/dashboard`) and then runs `forge deploy`.*

---

## 🎨 **UI Theme: Williams F1 Inspired**

* Dark navy background (`bg-williamsBlueDark`)
* Cyan & white accents
* Gauge-style UI components
* Flag metaphors (green/yellow/red)

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

## 📜 License
Apache License 2.0
