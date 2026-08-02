# DevFlow Enterprise — Application Layout System

This documents the reusable **application shell** — the sidebar, navbar,
command menu, workspace switcher, and page primitives every authenticated
page in DevFlow Enterprise is built on top of.

**Scope.** Like the design system it sits on top of, this layer is layout
only: no data fetching, no business logic, no API calls. Every component
is prop-driven — pages/features pass in real organizations, users,
navigation, and notifications; nothing here reaches out to a backend.
The only exception is `src/components/layout/sample-data.ts`, a fixture
module used exclusively by the internal `/shell-preview` harness and by
component tests — nothing under `src/components/layout/**` imports it.

Try it live: run `npm run dev` and open `/shell-preview`. It exercises the
full shell with fixture data and has tabs to preview the loading, empty,
and error states in place.

## Contents

1. [Composition overview](#composition-overview)
2. [Folder structure](#folder-structure)
3. [AppShell](#appshell)
4. [Sidebar](#sidebar)
5. [WorkspaceSwitcher](#workspaceswitcher)
6. [Navbar](#navbar)
7. [Breadcrumb](#breadcrumb)
8. [PageHeader](#pageheader)
9. [PageContainer](#pagecontainer)
10. [Mobile navigation](#mobile-navigation)
11. [CommandMenu](#commandmenu)
12. [UserDropdown](#userdropdown)
13. [NotificationBell](#notificationbell)
14. [Layout states](#layout-states)
15. [Responsive behavior](#responsive-behavior)
16. [Accessibility](#accessibility)
17. [Motion](#motion)
18. [Design decisions](#design-decisions)
19. [Testing](#testing)

## Composition overview

`AppShell` is the single entry point. A route layout wires it up once with
real data and every page underneath just renders its content:

```tsx
// app/(app)/layout.tsx
"use client";

import { AppShell } from "@/components/layout/app-shell/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      organizations={organizations}
      projects={projects}
      activeOrganizationId={activeOrg.id}
      user={currentUser}
      notifications={notifications}
      onSelectOrganization={(id) => switchOrganization(id)}
      onLogout={() => signOut()}
    >
      {children}
    </AppShell>
  );
}
```

Internally, `AppShell` renders exactly the composition the spec calls for:

```
<AppShell>
  <Sidebar />
  <MainArea>
    <Navbar />
    <PageTransition>{children}</PageTransition>
  </MainArea>
</AppShell>
```

A page then composes the smaller primitives:

```tsx
export default function ProjectsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        description="Manage your software projects"
        breadcrumbs={[{ label: "Projects" }]}
        actions={<Button><Plus /> Create Project</Button>}
      />
      {/* page content */}
    </PageContainer>
  );
}
```

## Folder structure

```
src/components/layout/
  app-shell/            AppShell, MainArea, layout context, responsive hook, page transition
  sidebar/              Sidebar + Header/Item/Group/CollapseButton/Nav/Footer, nav-config, types
  workspace-switcher/   WorkspaceSwitcher, WorkspaceAvatar, WorkspaceItem, CreateWorkspaceButton
  navbar/                Navbar, GlobalSearchTrigger
  breadcrumbs/           AppBreadcrumb
  page-header/           PageHeader
  page-container/        PageContainer
  mobile-navigation/     MobileSidebarDrawer, MobileBottomNav
  command-menu/          CommandMenu (⌘K palette)
  user-menu/             UserDropdown
  notification-center/   NotificationBell, NotificationItem
  layouts/               SidebarSkeleton, NavbarSkeleton, LoadingLayout, EmptyWorkspaceState, ErrorBoundaryLayout
  sample-data.ts          Fixtures for /shell-preview and tests only
```

Every folder exports through an `index.ts` barrel — import from the
folder (`@/components/layout/sidebar`) rather than deep file paths where
possible. Each component family owns its own `types.ts` (e.g.
`sidebar/types.ts` owns `NavItem`/`NavGroup`) so a folder can be copied
into another project without pulling in unrelated types.

## AppShell

`src/components/layout/app-shell/app-shell.tsx`

The root container. Responsibilities:

- Owns sidebar collapse state (persisted, via `useUIPreferencesStore`) and
  mobile-drawer / command-menu state (ephemeral, via `useLayoutStore`).
- Detects the current responsive tier (`useResponsiveBreakpoint`) and
  applies the tablet-default-collapsed rule.
- Renders `<Sidebar>`, `<MainArea>` (which renders `<Navbar>` +
  `<PageTransition>{children}</PageTransition>`), an optional
  `<MobileBottomNav>`, and the global `<CommandMenu>`.
- Exposes all of the above via `useAppShell()` to any descendant.
- Renders a "Skip to main content" link as the very first focusable
  element, jumping to `#main-content` (the `<main>` MainArea renders).

### Props

| Prop | Type | Notes |
|---|---|---|
| `children` | `ReactNode` | Page content. |
| `organizations` / `projects` | `Organization[]` / `Project[]` | Passed straight through to `WorkspaceSwitcher`. |
| `activeOrganizationId` / `activeProjectId` | `string` | Current selection. |
| `onSelectOrganization` / `onSelectProject` / `onCreateWorkspace` / `onWorkspaceSettingsClick` | callbacks | Workspace switcher actions. |
| `user` | `AppUser` | Rendered in the sidebar footer and navbar. |
| `onProfileClick` / `onAccountSettingsClick` / `onLogout` | callbacks | User menu actions. |
| `navGroups` | `NavGroup[]` | Defaults to `defaultNavGroups` (Dashboard, Projects, Tasks, Sprints, Documents, Repositories, Deployments, Monitoring, Analytics). |
| `footerNavGroup` | `NavGroup` | Defaults to Settings + Help & Support. |
| `breadcrumbs` | `AppBreadcrumbItem[]` | Optional — shown in the navbar's left slot. Most pages instead pass `breadcrumbs` to `PageHeader`. |
| `notifications` | `NotificationItem[]` | Defaults to `[]`. |
| `onNotificationClick` / `onMarkAllNotificationsRead` / `onClearAllNotifications` | callbacks | Notification actions. |
| `commandMenuGroups` | `CommandGroupConfig[]` | Defaults to a "Go to X" action auto-derived from `navGroups`. Pass your own to add more (recent items, quick actions). |
| `bottomNavItems` | `NavItem[]` | Optional — enables a fixed mobile bottom tab bar in addition to the drawer. |
| `logo` / `productName` / `homeHref` | — | Branding overrides for the sidebar header. |

### `useAppShell()`

```tsx
import { useAppShell } from "@/components/layout/app-shell/app-shell-context";

function SomePageWidget() {
  const { isMobile, sidebarCollapsed, breakpoint } = useAppShell();
  // adapt this component's own layout to the shell state
}
```

## Sidebar

`src/components/layout/sidebar/`

The main navigation rail. One component renders both the desktop/tablet
fixed rail **and** the mobile drawer from the same content, so behavior
never diverges between breakpoints.

```
Sidebar
├─ SidebarHeader        logo + product name + collapse button
├─ WorkspaceSwitcher
├─ SidebarNav             scrollable, derives `active` from the route
│   └─ SidebarGroup × N
│       └─ SidebarItem × N
└─ SidebarFooter        Settings / Help + UserDropdown
```

### Props

The spec calls out three core layout-state props — everything else is
optional content/data configuration with sensible defaults:

```ts
interface SidebarProps {
  collapsed: boolean;       // desktop/tablet: icon-only rail vs full rail
  mobileOpen: boolean;      // mobile: drawer open state
  onMobileClose: () => void;

  // content (all optional, or required only where there's no sane default)
  navGroups?: NavGroup[];
  footerNavGroup?: NavGroup;
  organizations: Organization[];
  projects: Project[];
  activeOrganizationId: string;
  user: AppUser;
  // …plus the callbacks listed under AppShell above
}
```

### SidebarItem

```ts
interface SidebarItemProps {
  label: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;   // computed by SidebarNav from usePathname(), not by the item itself
  badge?: string | number;
  disabled?: boolean;
  collapsed?: boolean; // icon-only + tooltip when true
}
```

States: default, hover (`hover:bg-accent`), active (primary-tinted
background + left indicator bar + `aria-current="page"`), disabled
(`aria-disabled`, `tabIndex={-1}`, dimmed). When collapsed, the visible
label is replaced with an `sr-only` span (not removed) so the link keeps
an accessible name, and a `Tooltip` shows the label on hover/focus.

### Keyboard navigation

`SidebarNav` implements roving arrow-key navigation across every
rendered item (Up/Down move focus, Home/End jump to first/last), on top
of ordinary Tab order — matching the feel of Linear/GitHub's sidebars.

### Widths

`SIDEBAR_WIDTH_EXPANDED = 280`, `SIDEBAR_WIDTH_COLLAPSED = 80`,
`SIDEBAR_DRAWER_WIDTH = 288` (`sidebar/constants.ts`), animated with
Framer Motion (`framer-motion`'s `animate={{ width }}`) using the design
system's `duration.base` / `easing.standard` tokens.

## WorkspaceSwitcher

`src/components/layout/workspace-switcher/`

Renders the active organization (square avatar + name + chevron) and, on
click, a dropdown listing all organizations, the active org's projects,
a "Create workspace" action, and workspace settings.

```ts
interface WorkspaceSwitcherProps {
  organizations: Organization[];
  projects: Project[];
  activeOrganizationId: string;
  activeProjectId?: string;
  collapsed?: boolean;
  onSelectOrganization?: (id: string) => void;
  onSelectProject?: (id: string) => void;
  onCreateWorkspace?: () => void;
  onSettingsClick?: () => void;
}
```

Sub-components (`WorkspaceAvatar`, `WorkspaceItem`,
`CreateWorkspaceButton`) are exported individually for reuse — e.g. a
settings page listing all organizations can reuse `WorkspaceItem` rows.

## Navbar

`src/components/layout/navbar/`

```
[ ☰ (mobile) ]  [ breadcrumb (optional, sm+) ]  …  [ Search ] [ Bell ] [ Account ]
```

```ts
interface NavbarProps {
  onOpenMobileNav: () => void;
  breadcrumbs?: AppBreadcrumbItem[];
  notifications: NotificationItem[];
  onNotificationClick?, onMarkAllNotificationsRead?, onClearAllNotifications?;
  user: AppUser;
  onProfileClick?, onAccountSettingsClick?, onLogout?;
}
```

`GlobalSearchTrigger` is a single button (not two conditionally-hidden
copies) that adapts its own contents via CSS: the "Search…" label and
`⌘K` hint hide on narrow viewports while the icon-only button remains —
this keeps exactly one accessible "Open search and command menu" control
in the DOM at all times, instead of duplicating it per breakpoint.

## Breadcrumb

`src/components/layout/breadcrumbs/breadcrumb.tsx` — exports
`AppBreadcrumb`.

```ts
interface AppBreadcrumbItem {
  label: string;
  href?: string;      // omit for the current/last page
  icon?: LucideIcon;
}

<AppBreadcrumb items={[{ label: "Projects", href: "/projects" }, { label: "Travel Platform" }]} maxVisible={4} />
```

Renders `Projects / Travel Platform`. Once there are more than
`maxVisible` items (default 4), the middle collapses into a "…" dropdown,
keeping the first and last two crumbs visible.

## PageHeader

`src/components/layout/page-header/page-header.tsx`

```ts
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: AppBreadcrumbItem[];
}
```

```tsx
<PageHeader
  title="Projects"
  description="Manage your software projects"
  actions={<Button><Plus /> Create Project</Button>}
/>
```

Stacks title/description above actions on mobile, sits side-by-side from
`sm:` up so action buttons never get cramped next to a long title.

## PageContainer

`src/components/layout/page-container/page-container.tsx`

The outermost element every page body should render, directly below
`PageHeader`. Delegates to the design system's `<Container size="default">`
(max-width 1440px on desktop, 16px horizontal padding on mobile) and adds
standard vertical page rhythm (`py-6 sm:py-8`, disable via `padded={false}`).

## Mobile navigation

`src/components/layout/mobile-navigation/`

- **`MobileSidebarDrawer`** — the off-canvas sidebar for <768px. Built on
  the `Sheet` primitive (Base UI `Dialog`) for accessible, correct focus
  trapping and Escape-to-close, composed automatically by `Sidebar` — you
  won't usually render this directly.
- **`MobileBottomNav`** — optional fixed bottom tab bar (per the spec:
  "Bottom navigation optional"). Not rendered unless `AppShell` is given
  `bottomNavItems`.

## CommandMenu

`src/components/layout/command-menu/command-menu.tsx`

Global ⌘K / Ctrl+K command palette, built on shadcn's `Command`
(`cmdk`) + `CommandDialog`. Mounted once by `AppShell`; self-registers the
keyboard shortcut and reads/writes `useLayoutStore().commandMenuOpen`, so
any other control (the navbar's `GlobalSearchTrigger`, a sidebar item, …)
can open it with `useLayoutStore.getState().setCommandMenuOpen(true)`.

```ts
interface CommandGroupConfig {
  id: string;
  heading: string;
  actions: {
    id: string;
    label: string;
    icon?: LucideIcon;
    shortcut?: string;
    keywords?: string[];
    onSelect: () => void;
  }[];
}
```

`AppShell` auto-derives a "Navigate" group ("Go to Dashboard", "Go to
Projects", …) from `navGroups` if you don't pass `commandMenuGroups`
yourself — pass your own to add recent items, quick actions, etc.

## UserDropdown

`src/components/layout/user-menu/user-dropdown.tsx`

Account menu: profile, account settings, billing, theme switch
(light/dark/system, wired to `next-themes`), logout. Used in both the
sidebar footer (`variant="full"`: avatar + name + chevron, or
`variant="compact"` when the rail is collapsed) and the navbar
(`variant="compact"`, avatar only).

## NotificationBell

`src/components/layout/notification-center/notification-bell.tsx`

```ts
interface NotificationBellProps {
  notifications: NotificationItem[];
  onNotificationClick?, onMarkAllRead?, onClearAll?;
}
```

Shows an unread-count badge and, on click, a scrollable list with a
"Mark all read" header action and a "Clear all" footer action. Built on
`Popover`, not `DropdownMenu` — see [Design decisions](#design-decisions).

## Layout states

`src/components/layout/layouts/`

| Component | Use for |
|---|---|
| `SidebarSkeleton` / `NavbarSkeleton` | Individual shell-shaped placeholders. |
| `LoadingLayout` | Full-shell loading fallback (Suspense fallback or manual loading branch) composed from the two skeletons above. |
| `EmptyWorkspaceState` | No organization/workspace yet (e.g. right after sign-up). Center it inside a `PageContainer`. |
| `ErrorBoundaryLayout` | Class-based error boundary (React requires a class here — there is no hook equivalent) with a full-width fallback and a "Try again" retry button. Pass a custom `fallback` component for bespoke error pages. |

```tsx
<ErrorBoundaryLayout onError={(error) => reportToMonitoring(error)}>
  <ProjectsPage />
</ErrorBoundaryLayout>
```

## Responsive behavior

| Tier | Width | Sidebar | Navbar |
|---|---|---|---|
| Desktop | ≥ 1280px | Fixed rail, user's saved expand/collapse preference | Full breadcrumb + search input + bell + account |
| Tablet | 768–1279px | Fixed rail, **collapsed by default** (one-time default on entering this tier; the user can still expand it) | Same as desktop |
| Mobile | < 768px | Off-canvas drawer (`MobileSidebarDrawer`), opened via the navbar's hamburger button | Hamburger + icon-only search + bell + account; breadcrumb hidden |

These three tiers (`useResponsiveBreakpoint`, in `app-shell/use-responsive.ts`)
are distinct from the design system's Tailwind breakpoints (`sm`/`md`/`lg`/…)
— they're what the shell itself reasons about for structural changes
(rail vs. drawer), while individual components still use Tailwind's
breakpoints for their own internal responsive tweaks (e.g. hiding the
search placeholder text below `sm:`).

## Accessibility

- **Skip link.** `AppShell` renders a "Skip to main content" link, visible
  on focus, jumping to `#main-content`.
- **Landmarks.** `Sidebar` is `<aside aria-label="Sidebar">`,
  `SidebarNav`/`MobileBottomNav` are `<nav aria-label="Primary">`,
  `MainArea`'s content region is `<main id="main-content">`.
- **Keyboard navigation.** Full Tab order throughout; `SidebarNav` adds
  roving arrow-key navigation (Up/Down/Home/End); the command menu
  supports the standard combobox keyboard model (Up/Down/Enter/Escape).
- **Focus management.** The mobile drawer and command menu are both Base
  UI `Dialog`s — focus is trapped inside while open and restored to the
  triggering element on close.
- **Accessible names everywhere.** Icon-only controls always carry an
  `aria-label` (collapse button, hamburger, notification bell, account
  menu). Collapsed `SidebarItem`s replace their visible label with an
  `sr-only` span rather than removing it, so screen readers still
  announce the destination even though it's visually icon-only.
- **State conveyed to assistive tech.** Active nav items use
  `aria-current="page"`; the collapse button uses `aria-pressed`; the
  unread notification count is included in the bell's `aria-label`
  (`"Notifications (2 unread)"`), not just a visual badge.
- **Color contrast.** All text/background pairings use the design
  system's semantic tokens, already audited for WCAG AA in
  `docs/design-system/08-accessibility.md`.
- **Reduced motion.** `PageTransition` calls `useReducedMotion()` and
  neutralizes its animation via `withReducedMotion()` when the user has
  `prefers-reduced-motion: reduce` set.

Every component family listed under [Testing](#testing) includes an
`axe` (via `jest-axe`) assertion of zero accessibility violations.

## Motion

All motion uses the design system's Framer Motion variant library
(`src/design-system/motion/variants.ts`) — nothing here invents new
easing curves or durations:

| Interaction | Variant / mechanism |
|---|---|
| Sidebar collapse | `motion.aside` animating `width` between `SIDEBAR_WIDTH_COLLAPSED`/`EXPANDED` with `duration.base` / `easing.standard`. |
| Drawer (mobile sidebar) | `Sheet` (Base UI `Dialog`) handles the accessible open/close transition (slide-from-left, CSS-driven); `staggerContainer`/`staggerItem` fade the content in on top. See [Design decisions](#design-decisions) for why. |
| Dropdown / popover / menu | Handled by each Base UI primitive's own open/close transition (already tuned to match `dropdownContent`'s timing in the design system). |
| Page transition | `PageTransition` wraps route content in `pageTransition` (fade + 8px rise), keyed by `usePathname()`, via `AnimatePresence`. |

## Design decisions

**Why `Sheet` (not raw Framer Motion) for the mobile drawer?**
The spec asks for both "Drawer: Slide from left" (Framer Motion) and
full accessibility (focus trap, Escape-to-close, ARIA). Base UI's
`Dialog` already provides correct, battle-tested focus-trapping and
dismissal semantics with a CSS slide-from-left transition built in.
Re-implementing that with raw `AnimatePresence` would mean re-deriving
focus-trap logic by hand — a common source of subtle a11y bugs. We use
`Sheet` for the structural/a11y foundation and layer Framer Motion
(`staggerContainer`/`staggerItem`) on top for the content reveal, rather
than fighting the primitive's own transition.

**Why `Popover` (not `DropdownMenu`) for notifications?**
A `DropdownMenu` is a single-select menu with roving-tabindex semantics
built for choosing one of several commands. The notification list is a
richer, scrollable region with per-row navigation and independent header
actions ("mark all read") — closer to a popover than a menu. Using
`Popover` avoids fighting the menu primitive's keyboard model for content
it wasn't designed for.

**Why does `Sidebar` render both the rail and the drawer unconditionally?**
So behavior can never diverge between breakpoints — there's exactly one
implementation of "what the sidebar contains," and the rail vs. drawer
split is purely about the outer chrome (fixed rail vs. `Sheet`). Base
UI's `Dialog` doesn't mount the drawer's contents into the DOM at all
until it's opened for the first time (`Portal` returns `null` while
`!mounted && !keepMounted`), so this costs nothing on desktop.

**Why is `commandMenuGroups` auto-derived from `navGroups` by default?**
So `<AppShell navGroups={…}>` is immediately useful without also having
to hand-write "Go to X" command actions for every nav item — while still
letting you pass your own `commandMenuGroups` to add anything the
sidebar doesn't have (recent items, quick actions, keyboard-only
commands).

**Why a single `GlobalSearchTrigger`, not two responsive copies?**
Rendering two elements and toggling visibility with `hidden sm:block` /
`sm:hidden` (as is common) creates two controls with the same accessible
name simultaneously in the DOM — bad for assistive tech, and it also
means unit tests (which don't evaluate real CSS/media queries) see
duplicate matches. One element that adapts its own inner content via CSS
avoids both problems.

## Testing

Component tests use **Vitest** + **React Testing Library** + **jsdom**,
with `jest-axe` for automated accessibility checks.

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Setup lives in `vitest.config.mts` / `vitest.setup.ts` (jsdom polyfills
for `matchMedia`, `ResizeObserver`, `scrollIntoView`; `jest-dom` +
`jest-axe` matchers registered globally).

Per the testing requirements, there are dedicated suites for:

| Suite | File | Covers |
|---|---|---|
| `AppShell` | `app-shell/app-shell.test.tsx` | Full composition, mobile drawer, collapse toggle, tablet-default-collapsed, command menu + navigation, notifications, a11y. |
| `Sidebar` | `sidebar/sidebar.test.tsx` | Nav rendering, active-route detection, badges, collapsed accessible names, collapse button, workspace switcher, user menu, a11y. |
| `Navbar` | `navbar/navbar.test.tsx` | Search/bell/account triggers, mobile menu callback, unread count, breadcrumb rendering, opening the command menu, a11y. |
| `CommandMenu` | `command-menu/command-menu.test.tsx` | Closed-by-default (not in the DOM), ⌘K shortcut, groups/actions, selection + auto-close, search filtering, a11y. |
| `WorkspaceSwitcher` | `workspace-switcher/workspace-switcher.test.tsx` | Trigger label, org/project listing scoped to the active org, selection callbacks, create-workspace callback, collapsed rendering, a11y. |

Each suite mocks `next/navigation` (`usePathname`/`useRouter`) rather than
a full router provider, and resets the two Zustand stores
(`useLayoutStore`, `useUIPreferencesStore`) between tests since they're
module-level singletons.
