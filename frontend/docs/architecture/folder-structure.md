# Folder Structure

Canonical layout for scalable frontend delivery.

```
frontend/
├── .storybook/                 # Storybook (main, preview, decorators, theme)
├── docs/
│   ├── design-system/
│   ├── components/
│   ├── engineering/
│   └── architecture/
├── public/
└── src/
    ├── app/
    │   ├── (public)/
    │   ├── (auth)/
    │   ├── (dashboard)/
    │   ├── design-system/      # Token showcase (not a product page)
    │   └── shell-preview/      # Layout harness
    ├── components/
    │   ├── ui/                 # Primitives (shadcn)
    │   ├── layout/             # AppShell + page-templates
    │   ├── forms/
    │   ├── data-display/
    │   ├── feedback/
    │   ├── navigation/
    │   ├── dashboard/
    │   └── architecture/       # PageError, PageSkeleton, empty states
    ├── features/
    │   └── _template/          # Feature module scaffold
    ├── hooks/
    ├── store/
    ├── lib/
    │   ├── api/
    │   ├── auth/
    │   ├── permissions/
    │   ├── patterns/
    │   └── utils.ts
    ├── config/
    ├── types/
    ├── providers/
    └── design-system/
```

## Placement rules

| Code | Location |
|------|----------|
| Primitive button/input | `components/ui` |
| Shared product pattern | `components/{forms,data-display,…}` |
| Domain UI | `features/<domain>/components` |
| Route composition | `app/(…)/…/page.tsx` |
| Server cache hooks | `features/<domain>/hooks` |
| API calls | `features/<domain>/services` |
| Global UI chrome state | `store/` |
| Permissions | `lib/permissions` |

## Deep dive

[frontend.md](./frontend.md) · Historical DS notes: [06-folder-structure.md](../design-system/06-folder-structure.md)
