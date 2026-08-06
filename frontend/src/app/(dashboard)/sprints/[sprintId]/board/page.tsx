"use client";

import { useParams } from "next/navigation";

import { SprintDetailShell } from "@/features/sprints";

export default function SprintBoardPage() {
  const params = useParams<{ sprintId: string }>();
  return <SprintDetailShell sprintId={params.sprintId} />;
}
