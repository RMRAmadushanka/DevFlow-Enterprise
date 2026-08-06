# Testing Standards

## Stack

| Layer | Tool |
|-------|------|
| Unit / component | **Vitest** + React Testing Library + user-event |
| Accessibility assertions | jest-axe |
| Story docs / interaction | Storybook + `@storybook/addon-a11y` |
| Visual regression (future) | Chromatic (`@chromatic-com/storybook` installed) |

> We standardize on **Vitest** (not Jest). APIs are compatible with common RTL guides.

## What every shared component needs

1. **Renders** with required props  
2. **Props / variants** behave as documented  
3. **Interactions** (click, keyboard)  
4. **Accessibility** smoke (`axe` where meaningful)  
5. **Loading / empty / error** when the component owns those states  

### Example — Button

- Renders label  
- Disabled state prevents activation  
- `onClick` fires  

### Feature modules

```
features/<name>/
  components/__tests__/
  hooks/__tests__/
  services/__tests__/
```

Cover permissions, validation, loading, and error paths.

## Commands

```bash
npm run test              # unit tests (jsdom project)
npm run test:watch        # watch mode
npm run test:storybook    # Storybook vitest browser project (optional)
```

## Visual testing (future)

Chromatic is wired via Storybook addon for visual regression:

1. Publish Storybook builds on PR  
2. Review UI diffs for unintended changes  
3. Gate merges on accepted baselines  

Document ownership in the design-system team before enabling CI gates.

## Anti-patterns

- Snapshot-only tests with no assertions on behavior  
- Testing implementation details (internal class names)  
- Hitting real networks in unit tests — mock `apiClient` / services  
