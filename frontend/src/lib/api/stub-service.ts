import { isLiveBackendMode, rejectStubMutation } from "./live-api";

/**
 * When Gateway + Keycloak are configured, stub-domain services may read
 * (returning empty local state) but must not pretend mutations persist.
 */
export function createStubAwareService<T extends object>(
  feature: string,
  mock: T,
  allowedReads: Array<keyof T | string>
): T {
  const allow = new Set(allowedReads.map(String));
  return new Proxy(mock, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") {
        return value;
      }
      const bound = (value as (...args: unknown[]) => unknown).bind(target);
      if (!isLiveBackendMode()) {
        return bound;
      }
      if (allow.has(String(prop))) {
        return bound;
      }
      return async () => rejectStubMutation(feature);
    },
  });
}
