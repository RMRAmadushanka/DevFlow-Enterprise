/** Enterprise role ladder — ordered from most to least privileged. */

export const ROLES = ["owner", "admin", "manager", "developer", "viewer"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  developer: "Developer",
  viewer: "Viewer",
};

/** Numeric rank for comparisons (higher = more privilege). */
export const ROLE_RANK: Record<Role, number> = {
  owner: 50,
  admin: 40,
  manager: 30,
  developer: 20,
  viewer: 10,
};

export function hasMinimumRole(userRole: Role, required: Role): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}
