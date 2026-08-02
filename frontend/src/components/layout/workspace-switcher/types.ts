export interface Organization {
  id: string;
  name: string;
  imageUrl?: string;
  /** Short display label, e.g. "Enterprise plan", "12 members". */
  meta?: string;
}

export interface Project {
  id: string;
  name: string;
  organizationId: string;
  imageUrl?: string;
  meta?: string;
}
