# Sprint & Agile Management

Frontend feature module for sprint planning, backlog, boards, releases, and
agile reporting in DevFlow Enterprise.

**Scope.** UI + mock services only — no Sprints backend. Reuses the Tasks
Kanban board for active sprint boards.

## Architecture

```
Page (app/(dashboard)/sprints | projects/:id/{sprints,backlog,releases,reports})
  → SprintsView / SprintDetailShell / BacklogBoard
    → Hooks (TanStack Query)
      → sprint.service.ts / backlog.service.ts / release.service.ts
      → useSprintStore (filters, sort, backlog selection)
```

Components never call services directly. Pages import from `@/features/sprints`.

Permissions: `sprint.read|create|update|delete` (plus `task.*` for board work).

## Routes

| Route | Purpose |
|-------|---------|
| `/sprints` | Workspace sprint list |
| `/sprints/new` | Create sprint |
| `/sprints/:sprintId` | Detail (overview / planning) |
| `/sprints/:sprintId/edit` | Edit form |
| `/sprints/:sprintId/board` | Sprint board (TaskBoard) |
| `/sprints/:sprintId/reports` | Burndown / burnup / velocity |
| `/sprints/:sprintId/members` | Capacity metrics |
| `/sprints/:sprintId/activity` | Activity timeline |
| `/projects/:projectId/sprints` | Project-scoped list |
| `/projects/:projectId/backlog` | Product backlog |
| `/projects/:projectId/releases` | Release timeline |
| `/projects/:projectId/reports` | Project sprint reports |

## Sprint lifecycle

1. **Planning** — create sprint, pull backlog items, estimate capacity  
2. **Active** — start sprint, track board + burndown  
3. **Completed** — complete sprint, review + retrospective  
4. **Archived** — historical retention  

## Planning workflow

- Product backlog: prioritized unplanned tasks with DnD reorder  
- Sprint planning board: backlog ↔ sprint assignment with capacity warnings  
- Story point totals and over-capacity alerts  

## Reporting

Props-based charts (memoized):

- `SprintBurndownChart` — ideal vs actual remaining  
- `SprintBurnupChart` — completed vs scope  
- `SprintVelocityChart` — committed vs completed across sprints  
- `CapacityPlanningCard` — member allocation  

Reusable dashboard widgets live under `components/widgets/`.

## Folder

```
src/features/sprints/
  components/   # list, planning, charts, modals, widgets
  hooks/
  services/
  schemas/
  types/
  store/sprint.store.ts
  constants/
  utils/
  index.ts
```

## Testing strategy

Vitest + RTL under `components/__tests__/`:

- Sprint list, planning, backlog, board wrapper  
- Burndown / velocity charts  
- Capacity planning, release timeline, reports  

```bash
npm test -- src/features/sprints
```

## Accessibility

- Keyboard DnD via `@dnd-kit` KeyboardSensor on backlog  
- Chart widgets require accessible `summary` strings  
- Status/health via semantic badges  
- WCAG AA focus and contrast through design-system primitives  
