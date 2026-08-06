# Typography

Typography carries hierarchy — not color tricks or oversized decoration.

## Stack

| Role | Font |
|------|------|
| UI / body | Inter (`--font-sans`) |
| Code | JetBrains Mono (`--font-mono`) |

## Scale

Prefer the shared `<Text>` primitive (`components/ui/typography`) and tokenized
type ramp over ad-hoc `text-[13px]` classes.

Typical product UI lives in:

- **Body** (~14px) for dense content
- **Title / heading** for page and section titles
- **Muted** secondary copy via `text-muted-foreground`

## Rules

- Truncate long titles with `truncate` / `line-clamp-*`
- Use `tabular-nums` for metrics and tables
- Do not invent one-off font families in features

## Deep dive

[02-design-tokens.md](./02-design-tokens.md) (typography section) and
`src/design-system/tokens/typography.ts`.
