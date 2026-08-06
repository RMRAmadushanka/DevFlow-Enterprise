/**
 * Hierarchical query-key factory helpers.
 * Features define their own keys by composing `createQueryKeys(scope)`.
 *
 * @example
 * const projectKeys = createQueryKeys("projects");
 * projectKeys.all            // ["projects"]
 * projectKeys.lists()        // ["projects", "list"]
 * projectKeys.list(params)   // ["projects", "list", params]
 * projectKeys.detail(id)     // ["projects", "detail", id]
 */

export function createQueryKeys<TScope extends string>(scope: TScope) {
  const all = [scope] as const;

  return {
    all,
    lists: () => [...all, "list"] as const,
    list: <TParams>(params: TParams) => [...all, "list", params] as const,
    details: () => [...all, "detail"] as const,
    detail: (id: string) => [...all, "detail", id] as const,
  };
}

export type QueryKeyFactory = ReturnType<typeof createQueryKeys>;
