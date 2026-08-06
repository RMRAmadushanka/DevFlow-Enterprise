# Getting Started

Onboarding guide for DevFlow Enterprise frontend engineers.

## Prerequisites

- Node.js 20+ recommended
- npm (repo default)
- Git

## Setup

```bash
cd frontend
npm install
```

## Run the application

```bash
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

Useful existing routes (not product features):

- `/design-system` — living token showcase
- `/shell-preview` — AppShell harness

## Storybook

```bash
npm run storybook
```

Docs UI: [http://localhost:6006](http://localhost:6006)

```bash
npm run build-storybook
```

## Testing

```bash
npm run test
npm run test:watch
```

## Lint & format

```bash
npm run lint
npm run format
npm run format:check
```

## Folder mental model

```
src/
  app/                 # Next.js routes (public / auth / dashboard groups)
  components/          # Shared UI libraries + architecture helpers
  features/_template/  # Copy this to start a domain feature
  hooks/ store/ lib/   # Shared hooks, Zustand UI state, api/auth/permissions
  config/ types/       # App config + shared contracts
  design-system/       # Tokens, theme, motion
docs/                  # Design system + engineering governance
.storybook/            # Storybook configuration
```

Read next:

1. [Design system introduction](../design-system/introduction.md)
2. [Frontend architecture](../architecture/frontend.md)
3. [Coding standards](./coding-standards.md)
4. [Git workflow](./git-workflow.md)

## First contribution tips

1. Prefer extending existing components over new ones  
2. Add a Storybook story for shared UI  
3. Run `npm run test` and `npm run lint` before opening a PR  
4. Follow Conventional Commits  
