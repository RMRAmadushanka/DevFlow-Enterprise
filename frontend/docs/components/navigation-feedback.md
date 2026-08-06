# DevFlow Enterprise — Navigation & Feedback System

Reusable interaction components for overlays, alerts, toasts, menus, tabs,
and command surfaces across DevFlow Enterprise.

**Scope.** Like [forms](./forms.md), [layout](./layout.md), and
[data-display](./data-display.md), this is a component layer only: no pages,
no API calls, no business workflows. Every surface is prop-driven.

## Contents

1. [Composition overview](#composition-overview)
2. [Folder structure](#folder-structure)
3. [Feedback — Modals & drawers](#feedback--modals--drawers)
4. [Feedback — Alerts, toasts & notifications](#feedback--alerts-toasts--notifications)
5. [Feedback — Loading, progress, error & success](#feedback--loading-progress-error--success)
6. [Navigation — Menus & command](#navigation--menus--command)
7. [Navigation — Tabs, breadcrumbs, stepper](#navigation--tabs-breadcrumbs-stepper)
8. [Navigation — Tooltip, popover, hover card](#navigation--tooltip-popover-hover-card)
9. [Accessibility](#accessibility)
10. [Responsive behavior](#responsive-behavior)
11. [Motion](#motion)
12. [Testing](#testing)
13. [Best practices](#best-practices)

## Composition overview

```tsx
import {
  Modal,
  ConfirmModal,
  Drawer,
  AlertBanner,
  toast,
  ToastProvider,
} from "@/components/feedback";

import {
  DropdownMenu,
  CommandPalette,
  Tabs,
  Breadcrumbs,
  Stepper,
  Tooltip,
} from "@/components/navigation";
```

Mount `<ToastProvider />` once near the app root (next to the theme provider).

## Folder structure

```
src/components/
  ui/context-menu.tsx      # new primitive
  ui/hover-card.tsx        # new primitive (Base UI PreviewCard)
  feedback/
    modal/                 # Modal, FormModal, ConfirmModal, SuccessModal
    dialog/                # QuickDialog + ui Dialog re-exports
    drawer/                # Drawer, DetailDrawer, FilterDrawer, PreviewDrawer
    alert/                 # AlertBanner, StatusMessage
    toast/                 # toast helpers + ToastProvider
    notification/          # NotificationPanel, Item, Badge, Group
    progress/              # ProgressIndicator
    loading/               # LoadingSpinner, LoadingOverlay
    error/                 # ErrorBoundary, ErrorState
    success/               # SuccessState
  navigation/
    dropdown/              # App DropdownMenu + ui re-exports
    menu/                  # Alias of dropdown primitives
    context-menu/          # Right-click menu
    command-menu/          # CommandPalette (standalone)
    tabs/                  # default | underline | pills
    breadcrumbs/
    pagination/            # re-exports data-display Pagination
    stepper/
    tooltip/
    popover/
    hover-card/            # HoverCard + PreviewHoverCard
```

## Feedback — Modals & drawers

### Modal

Sizes: `sm` | `md` | `lg` | `xl` | `full`

```tsx
<Modal
  open={open}
  onOpenChange={setOpen}
  title="Edit project"
  description="Update project details"
  size="lg"
  footer={<Button onClick={save}>Save</Button>}
>
  {/* fields */}
</Modal>
```

- Escape + overlay dismiss (blocked while `loading`)
- Focus trap + scroll lock via Base UI Dialog

### FormModal / ConfirmModal / SuccessModal

| Component | Use |
|-----------|-----|
| `FormModal` | Create/edit with Cancel + Submit |
| `ConfirmModal` | Delete/irreversible — `danger` / `warning` / `info` |
| `SuccessModal` | Completed action celebration |

```tsx
<ConfirmModal
  open={open}
  onOpenChange={setOpen}
  variant="danger"
  title="Delete Project?"
  description="This action cannot be undone."
  confirmLabel="Delete"
  onConfirm={handleDelete}
/>
```

### Drawer

Positions: `left` | `right` | `bottom`. Sizes: `sm` | `md` | `lg` | `full`.

Variants: `DetailDrawer` (content + activity), `FilterDrawer` (Apply/Reset),
`PreviewDrawer` (media slot).

### QuickDialog

Lightweight info/quick-action dialog. Prefer `ConfirmModal` for destructive flows.

## Feedback — Alerts, toasts & notifications

### AlertBanner

```tsx
<AlertBanner
  tone="warning"
  title="Production deployment requires approval"
  description="An admin must approve before this ships."
  dismissible
  onDismiss={() => {}}
/>
```

### StatusMessage

Inline loading/success/error/empty for forms, tables, and cards.

### Toast

```tsx
toast.success("Project created successfully");
toast.error("Deployment failed", {
  action: { label: "View Logs", onClick: openLogs },
});
```

### NotificationPanel

Filterable list with mark-all-read / clear — prop-driven (no store).
Shell-integrated bell remains at `layout/notification-center`.

## Feedback — Loading, progress, error & success

| Component | Notes |
|-----------|-------|
| `LoadingSpinner` | sm/md/lg |
| `LoadingOverlay` | `mode="local"` \| `"page"` |
| `ProgressIndicator` | linear \| circular |
| `ErrorBoundary` | Catches render errors |
| `ErrorState` | page / component / network / permission |
| `SuccessState` | Inline success (non-modal) |

## Navigation — Menus & command

### DropdownMenu / ContextMenu

```tsx
<DropdownMenu
  label="Project Actions"
  trigger={<Button variant="outline">Actions</Button>}
  items={[
    { id: "edit", label: "Edit", onSelect: edit },
    { id: "dup", label: "Duplicate", onSelect: dup },
    { id: "sep", label: "", separator: true },
    { id: "del", label: "Delete", destructive: true, onSelect: del },
  ]}
/>
```

### CommandPalette

Standalone ⌘K palette with categories + optional recent commands.
Shell-integrated version: `layout/command-menu` (shares layout store).

## Navigation — Tabs, breadcrumbs, stepper

### Tabs

Variants: `default` | `underline` | `pills` — icons, badges, disabled tabs.

### Breadcrumbs

Overflow collapses into a "…" dropdown (`maxVisible`, default 4).

### Stepper

Horizontal/vertical — statuses: completed / active / pending / error.

```tsx
<Stepper
  current={1}
  steps={[
    { id: "1", title: "Organization" },
    { id: "2", title: "Team" },
    { id: "3", title: "Project" },
    { id: "4", title: "Complete" },
  ]}
/>
```

### Pagination

Re-exported from `@/components/data-display/pagination`.

## Navigation — Tooltip, popover, hover card

| Component | Use |
|-----------|-----|
| `Tooltip` | Delayed label for icons/actions |
| `Popover` | Filters, settings, quick forms |
| `HoverCard` / `PreviewHoverCard` | User/project/repo previews |

## Accessibility

- Focus trap on Modal/Drawer/CommandPalette
- Escape dismiss (blocked while loading)
- ARIA roles: `alertdialog` patterns via Confirm, `status`/`alert` for messages
- Keyboard: menus, tabs, stepper, command list
- Tooltips work with keyboard focus via Base UI Tooltip
- WCAG AA contrast via design tokens

## Responsive behavior

| Viewport | Behavior |
|----------|----------|
| Desktop | Centered modals, side drawers |
| Mobile | Near full-bleed modals; bottom drawers for filters/preview |

## Motion

Framer Motion + design-system tokens:

- Modal: fade + subtle scale
- Drawer: Sheet slide (CSS)
- Toast: Sonner slide/fade
- Dropdown/tooltip: ui animate-in zoom/fade
- Success/empty: short rise-in

Keep motion ≤ ~400ms and subtle.

## Testing

```bash
npm test -- src/components/feedback src/components/navigation
```

Covered: Modal, Drawer, Dialog, Toast helpers, Dropdown, Tooltip, CommandPalette, Stepper — open/close, keyboard, a11y.

## Best practices

1. **Prefer ConfirmModal for destructive actions** — not a generic Modal with red buttons.
2. **Mount ToastProvider once** — call `toast.*` from anywhere.
3. **Use layout CommandMenu inside AppShell**; use navigation `CommandPalette` for standalone/embeddable palettes.
4. **Don't nest interactive controls** inside ContextMenu/Dropdown triggers incorrectly — pass a single element via `render`/`trigger`.
5. **Keep overlays controlled** from the feature (`open` / `onOpenChange`) so URL/query state can own them.
6. **Reuse data-display Pagination / Progress / Spinner** — feedback wrappers are thin aliases where listed.
