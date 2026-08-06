# Git Workflow

## Branch naming

```
feature/<short-description>
fix/<short-description>
refactor/<short-description>
docs/<short-description>
chore/<short-description>
```

Examples:

```
feature/project-management
fix/sidebar-collapse
refactor/button-system
docs/storybook-governance
```

## Conventional Commits

Format:

```
<type>(optional-scope): <description>
```

| Type | Use |
|------|-----|
| `feat` | New user-facing capability / component |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Internal change, no behavior change |
| `test` | Tests only |
| `chore` | Tooling, deps, config |
| `style` | Formatting (prefer Prettier) |
| `perf` | Performance improvement |

Examples:

```
feat: add project table component
fix: restore focus after modal close
docs: add Storybook governance guide
test: cover PermissionGuard denial path
```

## Pull requests

- Keep PRs focused (one concern)
- Link issues when applicable
- Fill the [review checklist](./review-process.md)
- Do not commit secrets (`.env`, credentials)

## Releases

See [Semantic Versioning](#semantic-versioning) below.

## Semantic Versioning

`MAJOR.MINOR.PATCH` — example `1.4.2`

| Bump | When |
|------|------|
| **Major** | Breaking public API / token / component contract changes |
| **Minor** | Backward-compatible features / new components |
| **Patch** | Bug fixes, docs, internal refactors |

Design-system consumers should treat exported component props and tokens as public API.
