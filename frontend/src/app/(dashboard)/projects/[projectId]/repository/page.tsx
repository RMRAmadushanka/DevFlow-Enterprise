"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import {
  ProjectDetailShell,
  ProjectEmptyState,
  ProjectRepositoryCard,
} from "@/features/projects";

export default function ProjectRepositoryPage() {
  const params = useParams<{ projectId: string }>();

  return (
    <ProjectDetailShell projectId={params.projectId}>
      {(project) => (
        <div className="flex flex-col gap-4">
          {project.repository ? (
            <ProjectRepositoryCard repository={project.repository} />
          ) : (
            <ProjectEmptyState variant="no-repository" />
          )}
          <div>
            <Button
              render={<Link href={routes.app.repositories} />}
              variant="outline"
              size="sm"
            >
              Browse all repositories
            </Button>
          </div>
        </div>
      )}
    </ProjectDetailShell>
  );
}
