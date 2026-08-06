# Code Review Process

## Goals

Catch defects early, protect accessibility and design-system quality, and keep
PRs learnable for a multi-team org.

## Pull Request checklist

### Functionality

- [ ] Feature / change works as described
- [ ] Edge cases considered (empty, loading, error, permission denied)
- [ ] No unintended regressions in nearby surfaces

### Quality

- [ ] No duplicate UI or logic — reused existing primitives where possible
- [ ] Types are correct (`strict`, no `any`)
- [ ] Naming follows [coding standards](./coding-standards.md)
- [ ] No secrets committed

### UI

- [ ] Responsive (mobile + desktop)
- [ ] Dark mode + light mode verified
- [ ] Matches design tokens (no hardcoded colors)
- [ ] Motion is subtle and purposeful

### Accessibility

- [ ] Keyboard path works
- [ ] Focus styles visible
- [ ] Icon-only controls labeled
- [ ] Storybook a11y panel checked for new UI

### Testing & docs

- [ ] Tests included / updated
- [ ] Storybook story added for new shared components
- [ ] Docs updated when contracts change

## Reviewer expectations

- Prefer questions and concrete suggestions over vague “nit”
- Block on a11y / security / data-loss risks
- Approve when remaining comments are non-blocking

## Authors

- Keep PRs small and scoped
- Respond to feedback or explain tradeoffs
- Do not force-push shared branches after review without coordination
