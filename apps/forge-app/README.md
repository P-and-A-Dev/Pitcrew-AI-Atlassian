# PitCrew AI - Jira Forge App

**Jira Integration & Dashboard Hosting**

Forge app that embeds the PitCrew AI dashboard as a Jira project page and will eventually provide resolvers for real-time data integration.

---

## 🎯 **Purpose**

This Forge app serves as the **Jira integration point** for PitCrew AI:

1. **Dashboard Hosting:** Serves the React dashboard as a static Custom UI in Jira
2. **Resolvers:** (Planned) Backend functions to fetch PR data from Bitbucket Forge app
3. **Rovo Agents:** (Planned) AI-powered PR insights and weekly reports

---

## 📦 **Current Implementation**

### Manifest Structure

```yaml
modules:
  jira:projectPage:
    - key: pitcrew-ai-project-page
      resource: main
      resolver:
        function: resolver
      title: PitCrew AI

  function:
    - key: resolver
      handler: index.handler

resources:
  - key: main
    path: static/dashboard
```

### Static Resources

The built React dashboard is served from `static/dashboard/`:
* Built by: `apps/dashboard` (Vite build)
* Output configured to: `apps/forge-app/static/dashboard`
* Accessed via Jira project page module

---

## 🚀 **Setup**

### Prerequisites

* Forge CLI installed
* Atlassian account
* Jira site access

### Installation

```bash
# Login to Forge
forge login

# Deploy the app
forge deploy

# Install to a Jira site
forge install
```

---

## 🛠️ **Development**

### Tunnel for Live Development

```bash
forge tunnel
```

This allows you to:
* Test dashboard changes without redeploying
* Debug resolver functions
* See live logs

### Deploy Changes

```bash
forge deploy
```

Required when:
* Manifest.yml changes
* Resolver code changes (src/index.js)
* Dashboard rebuild (static files updated)

---

## 📁 **Project Structure**

```
forge-app/
├── manifest.yml           # Forge app configuration
├── src/
│   └── index.js          # Resolver handler (minimal)
├── static/
│   └── dashboard/        # Built React dashboard (from apps/dashboard)
├── package.json
└── README.md
```

---

## 🔮 **Planned Features**

### Resolvers (Next Phase)

Backend functions to provide data to the dashboard:

```javascript
// Example planned resolvers
export async function getPrTelemetry(req) {
  // Fetch PRs from Bitbucket Forge app storage
  // Return formatted data for dashboard
}

export async function getHighRiskPrs(req) {
  // Query red PRs from storage
  // Return list for Flags view
}
```

### Rovo Agents (Future)

* **PitCrew PR Analyst:** AI summaries of PRs
* **PitCrew Race Reporter:** Weekly team performance reports

### Jira Deep Integration (Future)

* Custom fields for PR risk scores
* Auto-create issues for high-risk PRs
* Sprint board integration

---

## 🔧 **Configuration**

### Runtime

* **Node.js:** 22.x
* **Architecture:** ARM64
* **Memory:** 256MB

### Permissions

Currently minimal. Will add:
* `storage:app` (to read from shared storage)
* `read:jira-work` (to query Jira issues)

---

## 📊 **Integration Flow**

```
User Opens Jira Project
  ↓
Jira loads PitCrew AI project page
  ↓
Forge serves React dashboard (static/dashboard)
  ↓
Dashboard makes resolver calls (future)
  ↓
Resolvers fetch data from Bitbucket Forge app storage
  ↓
Dashboard displays real-time telemetry
```

---

## 🧪 **Testing**

### Manual Testing

1. Install app on Jira site
2. Navigate to any project
3. Click "PitCrew AI" in left sidebar
4. Dashboard should load with Williams F1 theme

### Logs

```bash
forge logs --tail
```

---

## 🚧 **Known Limitations**

* **Resolver not implemented:** Currently returns mock data
* **No Rovo agents:** Planned for next phase
* **Static data only:** Dashboard shows sample data, not real PRs

---

## 📚 **Resources**

* **Forge Docs:** https://developer.atlassian.com/platform/forge/
* **Custom UI:** https://developer.atlassian.com/platform/forge/custom-ui/
* **Jira Modules:** https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-project-page/

---

Built for **Codegeist 2025: Williams Racing Edition** 🏎️
