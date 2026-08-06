# Feedback

## Purpose

Communicate system status without blocking the user’s mental model — alerts,
toasts, modals, drawers, progress, and error states.

## Usage

| Need | Component |
|------|-----------|
| Persistent page notice | `AlertBanner` |
| Transient success/error | `toast` + `ToastProvider` |
| Confirm destructive action | `ConfirmModal` |
| Side detail / filters | `Drawer` variants |
| Inline form/table message | `StatusMessage` |
| Crash isolation | `ErrorBoundary` / `PageError` |

## When not to use

- Don’t toast every keystroke or filter change
- Don’t use modals for simple navigation
- Don’t rely on color alone for status

## Variants

Success · Error · Warning · Info (and Confirm: Danger / Warning / Information)

## Accessibility

- Overlays trap focus and support Escape
- Toasts should be polite live regions (Sonner defaults)
- Confirm actions need clear labels (“Delete project”)

## Examples

```tsx
import { AlertBanner, toast } from "@/components/feedback";

<AlertBanner tone="warning" title="Approval required" dismissible />
toast.success("Project created");
```

## Storybook

`Feedback/AlertBanner` — Controls for `tone`, Actions for dismiss.

## Related

Deep guide: [navigation-feedback.md](./navigation-feedback.md)
