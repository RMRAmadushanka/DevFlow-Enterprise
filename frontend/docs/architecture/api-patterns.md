# API Patterns

## Layering

```
Page / Template
  → Feature hook (useGetX / useCreateX)
    → Feature service (x.service.ts)
      → apiClient (lib/api)
        → network
```

## Rules

- **No UI in services** — no toasts, no navigation, no React  
- **No fetch in components** — hooks only  
- Typed DTOs in `features/<domain>/types`  
- Failures throw `ApiError` (`lib/api/errors`)  
- Query keys via `createQueryKeys("domain")`

## Service shape

```ts
export const projectService = {
  list: (params) => apiClient("/api/projects", { query: params }),
  getById: (id) => apiClient(`/api/projects/${id}`),
  create: (input) => apiClient("/api/projects", { method: "POST", body: input }),
  update: (id, input) => apiClient(`/api/projects/${id}`, { method: "PATCH", body: input }),
  remove: (id) => apiClient(`/api/projects/${id}`, { method: "DELETE" }),
};
```

## Hook shape

```ts
export const projectKeys = createQueryKeys("projects");

export function useGetProjects(params) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectService.list(params),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.lists() }),
  });
}
```

## Form mutation workflow

Open → Validate (Zod) → Mutate → Toast → Invalidate  

Contract: `src/lib/patterns/form-workflow.ts`

## Auth

Session accessors are stubs in `lib/auth` until a provider is wired.
Mount `PermissionProvider` in the authenticated layout when session exists.

## Reference implementation

`src/features/_template` — copy and rename Entity → domain.
