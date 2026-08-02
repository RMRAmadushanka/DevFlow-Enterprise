# 11. Usage Guide

Practical guidance for consuming this design system when building actual
product pages later (out of scope for this deliverable, but this is how
that future work should plug in).

## Golden rules

1. **Never hardcode a color, spacing value, radius, or shadow.** If the
   token you need doesn't exist, add it to the system first (see
   [Design Tokens](./02-design-tokens.md) and
   [CSS Variables](./05-css-variables.md)), then use it. A one-off
   `bg-[#1a1a1a]` in feature code is a bug.
2. **Build with primitives from `src/components/ui`, not raw HTML.** Use
   `<Button>` not `<button className="…">`, `<Text variant="title">` not
   a bare `<h2>` with ad-hoc classes.
3. **New shadcn primitives**: run `npx shadcn add <component>` — it
   respects `components.json` and will use the token system automatically
   because the base color variables are already themed.
4. **Compose, don't fork.** If an existing primitive is 90% right, extend
   its `cva` variants (like this system did for `Badge`/`Alert` — adding
   `success`/`warning`/`info`) rather than duplicating the component.

## Common recipes

### Page shell

```tsx
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/typography";

export default function SomeFuturePage() {
  return (
    <Container className="py-10">
      <Text variant="heading" as="h1">Pipelines</Text>
      <Text tone="secondary">Manage and monitor CI/CD pipelines.</Text>
      {/* … */}
    </Container>
  );
}
```

### Status indicator

```tsx
<Badge variant="success"><Check size={iconSize.xs} /> Passed</Badge>
<Badge variant="warning">Flaky</Badge>
<Badge variant="destructive">Failed</Badge>
```

### Form field (with React Hook Form + Zod, once business forms exist)

```tsx
const schema = z.object({ name: z.string().min(1) });
const form = useForm({ resolver: zodResolver(schema) });

<div className="flex flex-col gap-1.5">
  <Label htmlFor="name">Name</Label>
  <Input id="name" aria-invalid={!!form.formState.errors.name} {...form.register("name")} />
</div>
```

### Data fetching (once an API exists)

```tsx
const { data, isLoading } = useQuery({ queryKey: ["pipelines"], queryFn: fetchPipelines });

if (isLoading) return <Skeleton className="h-6 w-full" />;
```

### UI-only global state

```tsx
const density = useUIPreferencesStore((s) => s.density);
```

## Theming a new page

Nothing to do — every primitive already resolves colors through the
active theme. Just don't introduce a component that reads
`document.body` classes or `window.matchMedia` directly; let
`next-themes` + the CSS variables handle it (see
[Theme Architecture](./03-theme-architecture.md)).

## Verifying a new component visually

Add it to `src/app/design-system/page.tsx` (the showcase) temporarily, or
run:

```bash
npm run dev
```

and open `http://localhost:3000/design-system`. Toggle the theme control
in the header and confirm the new component looks correct in both modes.

## Definition of done for a new design-system primitive

- [ ] Uses only semantic tokens (no raw colors/spacing)
- [ ] Works in dark and light themes
- [ ] Meets [accessibility rules](./08-accessibility.md)
- [ ] Motion (if any) follows [motion guidelines](./10-motion-guidelines.md)
- [ ] Responsive per [responsive rules](./09-responsive-rules.md) if it's
      a layout primitive
- [ ] Named per [naming conventions](./07-naming-conventions.md)
- [ ] Added to the showcase page for visual regression checking
- [ ] `npm run build` and `npx eslint .` pass with no errors
