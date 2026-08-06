# Navigation

## Purpose

Help users move through the product — menus, tabs, breadcrumbs, command palette,
tooltips, and steppers.

## Usage

| Need | Component |
|------|-----------|
| Action menu | `DropdownMenu` |
| Right-click / row actions | `ContextMenu` |
| Global search commands | `CommandPalette` (⌘K) |
| Section switching | `Tabs` |
| Hierarchy trail | `Breadcrumbs` |
| Setup flows | `Stepper` |
| Hint on hover/focus | `Tooltip` |
| Lightweight popover UI | `Popover` / `HoverCard` |

## When not to use

- Primary page navigation belongs in the AppShell sidebar/nav config
- Don’t nest menus deeper than necessary
- Don’t use tooltips as the only label for critical actions

## Accessibility

- Menus support arrow-key navigation
- Tabs follow roving tabindex patterns from the primitive
- Tooltips must appear on focus as well as hover

## Examples

```tsx
import { Tabs, Breadcrumbs, Tooltip } from "@/components/navigation";
```

## Related

Deep guide: [navigation-feedback.md](./navigation-feedback.md) · Shell: [layout.md](./layout.md)
