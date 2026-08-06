# Button

## Purpose

Primary interactive control for user actions across DevFlow.

## Usage

- Confirm primary workflows (`default`)
- Secondary / quiet actions (`secondary`, `outline`, `ghost`)
- Destructive confirmation (`destructive`)
- Inline text actions (`link`)
- Icon-only toolbars (`size="icon*"` + `aria-label`)

## When not to use

- Navigation to a new route → prefer `Link` / router links styled as buttons carefully
- Multi-option menus → `DropdownMenu`
- On/off state → `Switch` / `Checkbox`

## Variants

`default` · `secondary` · `outline` · `ghost` · `destructive` · `link`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | union above | `default` | Visual style |
| `size` | `default` \| `xs` \| `sm` \| `lg` \| `icon`… | `default` | Size scale |
| `disabled` | `boolean` | `false` | Disables activation |
| `onClick` | event handler | — | Action callback |

## States

Default · Hover · Active · Focus-visible · Disabled

Loading: compose with a spinner icon and `disabled` while a mutation runs.

## Accessibility

- Icon-only buttons **must** set `aria-label`
- Do not nest interactive elements
- Focus ring uses tokenized `ring`

## Responsive Behavior

Touch-friendly sizes (`sm`+) on mobile toolbars; avoid tiny icon buttons without adequate hit area.

## Examples

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" onClick={onSave}>Save</Button>
<Button variant="destructive">Delete</Button>
<Button size="icon" aria-label="Add"><Plus /></Button>
```

## Storybook

`UI/Button` — Controls for `variant` / `size` / `disabled`; Actions logs `onClick`.

## Related

Implementation: `src/components/ui/button.tsx`
