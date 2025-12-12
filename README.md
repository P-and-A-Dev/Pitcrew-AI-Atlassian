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

## 🏁 Status: Work In Progress

PitCrew AI is actively built during **Codegeist 2025**, targeting a polished MVP:
* [x] Project Structure (NPM Workspaces, Vite, Forge)
* [x] Dashboard UI Base (Williams Theme, Tailwind 4)
* [ ] Real-time PR Analysis
* [ ] Rovo Agents Integration

---

## 📜 License
Apache License 2.0
