# 🏎️ **PitCrew AI for Atlassian**

**Formula 1-inspired Engineering Telemetry for Jira & Bitbucket**

PitCrew AI transforms Jira and Bitbucket into an F1-style telemetry system for engineering teams.
It analyzes pull requests in real time, detects risks, recommends reviewers, flags issues, and generates weekly
race-style reports — all powered by Atlassian Forge, Rovo agents, and a fully custom React dashboard.

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

## 🔥 **Key Features**

### **1. Real-Time PR Risk Analysis**

Automatically evaluates each PR based on:

* diff size
* number of files
* presence of critical files
* missing test changes
* sprint timing

Produces a score from **0 to 100** with F1-style color flags:

* 🟢 Green
* 🟡 Yellow
* 🔴 Red

---

### **2. Rovo-Powered PR Insights**

PitCrew calls a dedicated agent: **PitCrew PR Analyst**.

It returns:

* a concise PR summary
* potential risks
* test coverage check
* suggested reviewer focus points
* optional risk adjustment (+/-10)

Output is posted directly as a comment in Bitbucket.

---

### **3. Sprint Telemetry Dashboard (Williams Racing Theme)**

A custom React + Vite + Tailwind + Atlaskit UI embedded in Forge.

Views:

* **Telemetry Panel**: risk distribution, open PR count, merge times
* **Flags & Incidents**: high-risk PRs, blocked PRs, sprint health
* **Sprint Race View**: PRs grouped into *On Track*, *In Pit Stop*, *Finished Lap*

---

### **4. Jira Integration**

PitCrew monitors Jira issue events:

* Links PRs to issues
* Adds warnings to Jira issues when linked PRs are high-risk
* Maintains sprint-aware calculations

---

### **5. Weekly “Race Report”**

A dedicated Rovo agent generates:

* PR stats
* top risky PRs
* reviewer load
* bottlenecks
* recommendations for the team

Published automatically as a comment or page in Jira.

---

## 🧠 **Tech Stack**

### **Frontend (Dashboard)**

* React
* TypeScript
* Vite
* Tailwind CSS
* Atlaskit

### **Backend / Integrations**

* Atlassian Forge
* Forge Functions, Resolvers, Scheduled Triggers
* Rovo Agents
* Bitbucket Webhooks
* Jira Webhooks

### **Data**

* Forge Storage API (key-value store)
* Aggregated metrics computed on the fly

---

## 🏗️ **Repository Structure**

```
pitcrew-ai-atlassian/
  apps/
    forge-app/      # Backend Forge app (webhooks, resolvers, Rovo integration)
    dashboard/      # React dashboard (Williams F1 style)
  docs/             # Documentation, diagrams, planning
  pnpm-workspace.yaml
  package.json
  README.md
```

---

## 🔧 **Setup & Installation**

### 1. Clone the repository

```
git clone <repo-url>
cd pitcrew-ai-atlassian
pnpm install
```

---

### 2. Configure the Forge app

```
cd apps/forge-app
forge login
forge deploy
forge install
```

---

### 3. Run the dashboard (local development)

```
cd apps/dashboard
pnpm dev
```

Dashboard will be available at:

```
http://localhost:5173
```

---

### 4. Build dashboard + deploy Forge

From project root:

```
pnpm deploy
```

This will:

1. Build the dashboard
2. Copy build into Forge app static resources
3. Deploy Forge app

---

## 🕸️ **Event Flow Architecture**

### **Bitbucket**

* `pr:opened` → compute risk → call Rovo → comment on PR
* `pr:updated` → re-analyse → update comment
* `pr:merged / declined` → update status

### **Jira**

* `issue_updated` → detect links to PRs
* warn on high-risk PRs linked to issues

### **Rovo**

* Agents:

    * `PitCrew PR Analyst`
    * `PitCrew Race Reporter`

---

## 📊 **Risk Score Algorithm (v1)**

Based on:

* diff size
* file count
* critical files
* missing test changes
* sprint end proximity

Range: 0-100
Risk colors applied automatically.

Full pseudo code is documented in `/docs/risk-model.md`.

---

## 🎨 **UI Theme: Williams F1 Inspired**

* Dark navy background
* Cyan & white accents
* Gauge-style UI components
* Flag metaphors (green/yellow/red)
* “Pit stop” and “race lap” terminology

---

## 🛠️ Scripts

From root:

| Command                | Description                 |
|------------------------|-----------------------------|
| `pnpm dev:dashboard`   | Run dashboard locally       |
| `pnpm dev:forge`       | Run Forge tunnel            |
| `pnpm build:dashboard` | Build dashboard only        |
| `pnpm deploy`          | Build + copy + deploy Forge |

---

## 🧪 Testing (Hackathon Scope)

Because of time constraints, tests focus on:

* PR parsing
* Risk scoring
* Webhook event validation
* API endpoints for dashboard

Automated UI tests may be added post-hackathon.

---

## 🏁 Status: Work In Progress

PitCrew AI is actively built during **Codegeist 2025**, targeting a polished MVP:

* Working PR risk telemetry
* F1 dashboard
* Rovo PR insights
* Weekly race report
* Seamless Jira + Bitbucket experience

---

## 📜 License

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

## 🤝 Contributors

* **Antonin Do Souto** — Fullstack & AI
* **Pietro Giacomelli** — Fullstack & Atlassian integration
