# Task & Issue Management

Frontend feature module for Kanban boards, tables, lists, and task details
in DevFlow Enterprise.

**Scope.** UI + mock services only — no Tasks backend. Calendar is a UI
foundation (month grid), not a full scheduling product.

## Architecture

```
Page (app/(dashboard)/tasks | projects/:id/tasks|board)
  → TasksView / TaskForm / TaskDetailsDrawer
    → Hooks (TanStack Query)
      → task.service.ts / comment.service.ts / attachment.service.ts
      → useTaskStore (filters, sort, view mode, selection, drawer)
```

Components never call services directly. Pages stay thin and import from
`@/features/tasks`.

Permissions reuse `@/lib/permissions`
(`task.read|create|update|delete`).

## Routes

| Route | Purpose |
|-------|---------|
| `/tasks` | Workspace tasks (board/table/list/calendar) |
| `/tasks/new` | Create task form |
| `/tasks/:taskId` | Full-page task detail (deep link) |
| `/tasks/:taskId/edit` | Edit form |
| `/projects/:projectId/tasks` | Project-scoped tasks list/views |
| `/projects/:projectId/board` | Project board (forces board view) |

Typed hrefs: `@/config/routes` (`routes.app.tasks`, `task(id)`,
`projectTasks`, `projectBoard`, …).

## Folder

```
src/features/tasks/
  components/   # board, table, drawer, forms, modals, badges
  hooks/        # useTasks, useTask, useTaskBoard, mutations
  services/     # task / comment / attachment mocks
  schemas/
  types/
  store/task.store.ts
  constants/
  utils/
  index.ts
```

## Components

| Area | Components |
|------|------------|
| Views | `TasksView`, `TaskBoard`, `TaskColumn`, `TaskCard`, `TaskTable`, `TaskList`, `TaskCalendarFoundation` |
| Chrome | `TaskSearch`, `TaskFilters`, `TaskSort`, `TaskHeader`, `TaskBulkActions`, `TaskQuickActions` |
| Detail | `TaskDetailsDrawer`, `TaskComments`, `TaskChecklist`, `TaskAttachments`, `SubTaskList`, `TimeTrackingCard`, `TaskWatcherList`, `TaskRelationCard`, `TaskHistory`, `TaskActivityTimeline` |
| Forms / modals | `TaskForm`, `CreateTaskModal`, `DeleteTaskModal`, `ArchiveTaskModal`, `MoveTaskModal` |
| Badges | `TaskStatusBadge`, `PriorityBadge`, `LabelBadge`, `TaskAssignee`, `TaskAvatarGroup` |

## Hooks

| Hook | Responsibility |
|------|----------------|
| `useTasks` | Filtered/sorted list (optional project scope) |
| `useTask` | Detail payload |
| `useTaskBoard` | Board columns + collapse chrome |
| `useTaskFilters` | Zustand filter/sort helpers |
| `useCreateTask` / `useUpdateTask` / `useMoveTask` | Mutations |
| `useDeleteTask` / `useArchiveTask` / `useDuplicateTask` | Lifecycle |
| `useBulkUpdateTasks` | Multi-select actions |
| Comment / attachment hooks | Nested detail data |

## State management

| Concern | Tool |
|---------|------|
| Filters, sort, view mode, selection, active drawer id, collapsed columns | Zustand `useTaskStore` |
| Lists / detail / board / comments / attachments | TanStack Query (`taskKeys`) |
| Form drafts | React Hook Form + Zod |

## Task workflow

Statuses: Backlog → To do → In progress → Review → Testing → Done  
Also: Blocked, Archived.

Board drag-and-drop uses `@dnd-kit` (pointer + keyboard sensors) and calls
`useMoveTask` on drop.

## Accessibility

- Keyboard DnD via `@dnd-kit` KeyboardSensor
- Status/priority via semantic `StatusBadge` tones
- Drawer focus managed by design-system Sheet/Drawer
- Search, filters, and bulk toolbar labeled for assistive tech
- Mobile: card/list layouts; drawer size `full` on small screens

## Testing strategy

Vitest + React Testing Library under `components/__tests__/`:

- Board, card, table
- Form, filters, search
- Drawer, comments, checklist
- Bulk actions

```bash
npm test -- src/features/tasks
```
