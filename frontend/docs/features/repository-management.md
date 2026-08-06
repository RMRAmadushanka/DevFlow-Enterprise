# Repository & Source Control Management

Frontend feature module for GitHub / GitLab / Azure DevOps / Bitbucket–style
repository management in DevFlow Enterprise.

**Scope.** UI + mock services only — no real Git backend, clone, push, or CI
execution. Designed for future provider API integration.

## Architecture

```
Page (app/(dashboard)/repositories | projects/:id/repository)
  → RepositoriesView / RepositoryDetailShell / RepositoryForm
    → Hooks (TanStack Query)
      → repository.service.ts / branch.service.ts / commit.service.ts / release.service.ts
      → useRepositoryStore (filters, view mode, selected branch, file tree expand)
```

Components never call services directly. Pages import from `@/features/repositories`.

Permissions: `repository.read|create|update|delete`.

## Routes

| Route | Purpose |
|-------|---------|
| `/repositories` | Workspace repository list |
| `/repositories/new` | Create / connect repository |
| `/repositories/:repositoryId` | Overview |
| `/repositories/:repositoryId/files` | Code browser |
| `/repositories/:repositoryId/branches` | Branch list |
| `/repositories/:repositoryId/commits` | Commit history |
| `/repositories/:repositoryId/pull-requests` | Pull requests |
| `/repositories/:repositoryId/releases` | Releases + tags |
| `/repositories/:repositoryId/webhooks` | Webhooks |
| `/repositories/:repositoryId/settings` | Settings |
| `/projects/:projectId/repository` | Project summary + link to list |

## Repository lifecycle

1. **Create / Connect / Import** — local create, remote connect (provider URL), import UI  
2. **Browse** — files, README, language breakdown, health  
3. **Collaborate** — branches, commits, pull requests, members/permissions  
4. **Ship** — tags, releases, webhooks  
5. **Govern** — archive, transfer, delete, favorites  

## Permissions model (repo roles)

| Role | Intent |
|------|--------|
| Owner | Full control |
| Maintainer | Admin settings + merge |
| Developer | Push / PR |
| Reporter | Read + comment |
| Guest | Read-only |

Workspace RBAC uses `repository.*` permissions for page actions.

## Components (selected)

- List: `RepositoryCard`, `RepositoryGrid`, `RepositoryTable`, filters/search  
- Detail: `RepositoryDetailShell`, `RepositoryOverview`, `RepositorySettings`  
- Source: `BranchList`, `CommitList` / `CommitTimeline`, `PullRequestList`  
- Code: `CodeBrowser`, `FileTree`, `FileViewer` (syntax highlight placeholder)  
- Release: `ReleaseList`, `TagList`, webhook modals  
- Widgets: health, recent commits, open PRs, latest releases, branch summary, activity  

## Future integration strategy

- Replace mock services with provider adapters (GitHub App, GitLab OAuth, Azure DevOps PAT, Bitbucket).  
- Keep hook/query-key contracts stable; swap `queryFn` implementations only.  
- File viewer can adopt Shiki/Monaco later behind `FileViewer`.  
- Webhook delivery logs and PR checks become live once CI webhooks land.  

## Accessibility

- Icon buttons labeled; view toggles use `aria-pressed`  
- File explorer exposes `aria-label`; tree expand/collapse keyboard-friendly  
- Drawers manage focus for commit/PR details  
- Target WCAG AA via design-system tokens  

## Folder

```
src/features/repositories/
  components/   # list, detail, code browser, modals, widgets
  hooks/
  services/
  schemas/
  types/
  store/repository.store.ts
  constants/
  utils/
  index.ts
```

## Testing strategy

Vitest + React Testing Library under `components/__tests__/`:

- Repository list & card  
- Create form  
- Branch / commit / PR / release lists  
- Code browser  
- Settings  

Mock hooks for unit tests; mock services remain for future integration tests.
