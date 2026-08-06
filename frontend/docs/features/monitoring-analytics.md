# Monitoring, Observability & Analytics

Frontend feature module for Datadog / Grafana / Sentry–style platform monitoring
and analytics in DevFlow Enterprise.

**Scope.** UI + mock services only — no agents, telemetry pipelines, or
third-party cloud integrations.

## Architecture

```
Page (app/(dashboard)/monitoring | analytics)
  → MonitoringDashboard / AlertsView / IncidentsView / AnalyticsView / …
    → Hooks (TanStack Query)
      → monitoring / metrics / alerts / audit / analytics services
      → useMonitoringStore (filters, selection, custom dashboard widgets)
```

Components never call services directly. Pages import from `@/features/monitoring`.

Permissions:

- `monitoring.read|update|manage`
- `analytics.read|export`

## Routes

| Route | Purpose |
|-------|---------|
| `/monitoring` | Main observability dashboard |
| `/monitoring/services` | Service health grid |
| `/monitoring/alerts` | Alert rules & history |
| `/monitoring/incidents` | Incident list + drawer |
| `/monitoring/errors` | Error tracking |
| `/monitoring/audit` | Audit logs & user activity |
| `/analytics` | Engineering analytics |
| `/analytics/reports` | Custom reports |
| `/analytics/executive` | Executive overview |

## Monitoring model

- **System health** — overall status, CPU/memory/disk/network, DB/API UI status  
- **Services** — Auth, Projects, Tasks, Repos, Deployments, Documents, Notifications, Analytics  
- **Metrics** — time-series via Recharts wrappers (`LineChartWidget`, `AreaChartWidget`, …)  
- **Alerts** — severity, threshold rules, channels (UI), history  
- **Incidents** — lifecycle timeline, related alerts, postmortem UI  
- **Errors** — grouped messages, stack trace viewer, environment  

## Analytics model

- Engineering velocity, deployment success, sprint completion  
- Team utilization & activity  
- Executive KPIs: project success, open incidents, platform health  
- Custom reports with schedule/export UI (PDF/CSV placeholders)  
- Custom dashboard widget picker (persist layout in Zustand)  

## Alert lifecycle

1. Create rule (metric + condition + threshold + channel)  
2. Active / Triggered / Acknowledged / Resolved / Disabled  
3. History entries for auditability  

## Incident workflow

1. Detected from alert or manual  
2. Investigating → Mitigating → Resolved  
3. Optional postmortem summary  
4. Timeline of actor updates  

## Components (selected)

- Dashboard: `MonitoringDashboard`, `SystemHealthCard`, `ServiceHealthGrid`, charts  
- Alerts/Incidents: `AlertList`, modals, `IncidentTimeline`, drawers  
- Errors/Audit: `ErrorTrackingTable`, `StackTraceViewer`, `AuditLogTable`  
- Analytics: `EngineeringDashboard`, `ExecutiveDashboard`, `ReportBuilder`  
- Widgets: health, alerts, incidents, errors, deployments, velocity, …  

## Accessibility

- Charts expose `role="img"` + summaries where provided by dashboard primitives  
- Status uses badges with text labels (not color-only)  
- Icon actions labeled; tables keyboard-navigable  
- Target WCAG AA via design-system tokens  

## Folder

```
src/features/monitoring/
  components/   # dashboard, charts, alerts, incidents, analytics, widgets
  hooks/
  services/
  schemas/
  types/
  store/monitoring.store.ts
  constants/
  utils/
  index.ts
```

## Testing strategy

Vitest + RTL under `components/__tests__/`:

- Monitoring dashboard  
- System health card  
- Metric charts  
- Alert list  
- Incident timeline  
- Audit logs  
- Reports view  
- Executive dashboard  

Mock hooks for unit tests; swap services later for live telemetry APIs.
