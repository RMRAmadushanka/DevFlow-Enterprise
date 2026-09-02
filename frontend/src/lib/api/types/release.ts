/**
 * Release DTO shapes matching sprint-service `/api/releases`.
 */

export interface ReleaseDto {
  id: string;
  projectId: string;
  organizationId?: string | null;
  name: string;
  version: string | null;
  description: string | null;
  status: string;
  releaseDate: string | null;
  features: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReleaseRequest {
  projectId: string;
  name: string;
  version?: string | null;
  description?: string | null;
  status: string;
  releaseDate?: string | null;
  features?: string[];
}

export interface UpdateReleaseRequest {
  name?: string;
  version?: string | null;
  description?: string | null;
  status?: string;
  releaseDate?: string | null;
  features?: string[];
}

export interface ReleaseListQuery {
  projectId?: string;
}
