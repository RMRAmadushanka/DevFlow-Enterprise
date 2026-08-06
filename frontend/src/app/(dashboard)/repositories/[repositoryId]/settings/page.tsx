"use client";

import { useParams } from "next/navigation";

import { RepositoryDetailShell } from "@/features/repositories";

export default function RepositorySettingsPage() {
  const params = useParams<{ repositoryId: string }>();
  return <RepositoryDetailShell repositoryId={params.repositoryId} />;
}
