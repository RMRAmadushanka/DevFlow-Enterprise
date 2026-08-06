"use client";

import { useParams } from "next/navigation";

import { RepositoryDetailShell } from "@/features/repositories";

export default function RepositoryFilesPage() {
  const params = useParams<{ repositoryId: string }>();
  return <RepositoryDetailShell repositoryId={params.repositoryId} />;
}
