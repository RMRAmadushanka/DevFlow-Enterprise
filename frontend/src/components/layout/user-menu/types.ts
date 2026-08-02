export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  /** Display label for the user's role, e.g. "Admin", "Member", "Viewer". */
  role?: string;
}
