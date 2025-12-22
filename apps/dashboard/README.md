# PitCrew AI Dashboard

**Williams F1-Themed Engineering Telemetry Dashboard**

React dashboard for PitCrew AI, providing real-time visibility into PR health, team performance, and engineering metrics with a Formula 1 racing aesthetic.

---

## 🎨 **Features**

### 7 Core Views

1. **Dashboard** — Overview with KPIs, telemetry feed, risk distribution
2. **PR Telemetry** — Complete PR list with metrics and filtering
3. **Team Load** — Developer workload visualization
4. **Flags** — High-risk PRs requiring immediate attention
5. **Sprint Race** — Sprint progress with racing metaphors
6. **PR Detail** — Deep dive into individual PR analysis
7. **Components** — Showcase of all UI components

### UI Components (26+)

**Badges:** RiskBadge (green/yellow/red)  
**Cards:** KpiCard, PrCard, TelemetryCard, TeamLoadCard  
**Charts:** Risk distribution, team load, telemetry timeline  
**PR Components:** PRList, PRTimeline, PRMetrics, RiskExplanation  
**UI Elements:** RiskGauge, ViewTransition, ErrorBoundary

### Custom Hooks (6)

* `useTelemetry()` — PR telemetry data
* `useFlags()` — High-risk PR filtering
* `useSprint()` — Sprint metrics
* `useTeamLoad()` — Developer workload
* `useDashboardKpis()` — Global KPIs
* `useDashboardSummary()` — Dashboard summary

---

## 🏎️ **Williams F1 Theme**

* **Colors:** Dark navy (`#001F3F`), cyan (`#00D9FF`), white
* **Typography:** Clean, modern fonts (Inter/Roboto via Google Fonts)
* **Components:** Gauge-style meters, flag indicators
* **Metaphors:** "Pit Stop", "Race Lap", "Podium", "Telemetry"
* **Animations:** Smooth transitions, micro-interactions

---

## 🧠 **Tech Stack**

* **React:** 19.2.0 (latest)
* **TypeScript:** 5.9.3 (strict mode)
* **Vite:** 7.2.7 (with Rolldown for performance)
* **Tailwind CSS:** v4.1.18 (latest)
* **React Router:** 7.11.0
* **Recharts:** 3.5.1 (charts/graphs)
* **Forge Bridge:** 5.10.0 (Atlassian integration)
* **Vitest:** 4.0.16 (testing)

---

## 🚀 **Development**

### Local Development (Standalone)

```bash
npm run dev
# Open http://localhost:5173
```

Hot reload enabled for fast iteration.

### Development with Forge Integration

From `apps/forge-app`:
```bash
forge tunnel
```

Dashboard served from Forge with live backend.

---

## 🏗️ **Build**

### Production Build

```bash
npm run build
```

Output: `dist/` (or configured to `../../forge-app/static/dashboard` for Forge deployment)

### Type Checking

```bash
tsc -b
```

---

## 🧪 **Testing**

### Run Tests

```bash
npm test
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage

```bash
npm run test:coverage
```

**Current coverage:** ~5% (basic tests for RiskBadge, PRCard, useTelemetry)

---

## 📁 **Project Structure**

```
src/
├── App.tsx                  # Main router
├── main.tsx                 # Entry point
├── Components/
│   ├── badges/              # RiskBadge
│   ├── cards/               # KPI, PR, Telemetry cards
│   ├── pr/                  # PR-specific components
│   ├── telemetry/           # Telemetry feed
│   ├── flags/               # Flags summary
│   ├── header/              # Global header
│   ├── navigation/          # Breadcrumbs
│   ├── typography/          # Text components
│   ├── ui/                  # Generic UI (gauge, transitions)
│   └── error/               # Error boundary
├── views/                   # 7 main views
├── hooks/                   # 6 custom hooks
├── layout/                  # Layout components
├── assets/                  # Images, icons
└── test/                    # Test utilities
```

---

## ⚙️ **Configuration**

### Vite Config

* **Plugins:** React, Tailwind
* **Base:** `./` (for Forge compatibility)
* **Out Dir:** `../../apps/forge-app/static/dashboard`
* **Port:** 5173

### TypeScript Config

* **Strict mode:** Enabled
* **No unused vars:** Enforced
* **Target:** ES2022
* **Module resolution:** Bundler

### Tailwind Config

Located in `src/tailwind.config.ts`:
* Custom Williams theme colors
* Custom spacing, fonts
* Animation utilities

---

## 🎯 **Roadmap**

* [ ] Increase test coverage to 70%
* [ ] Connect hooks to real Forge APIs (replace mock data)
* [ ] Add global state management (Zustand/Context)
* [ ] Accessibility audit (a11y)
* [ ] Snapshot tests for all views
* [ ] Storybook for component documentation

---

## 📚 **Resources**

* **Forge Bridge Docs:** https://developer.atlassian.com/platform/forge/apis-reference/ui-api-bridge/
* **Tailwind v4:** https://tailwindcss.com/docs/v4-beta
* **Vite:** https://vitejs.dev/
* **React Router v7:** https://reactrouter.com/

---

Built for **Codegeist 2025: Williams Racing Edition** 🏎️💨
