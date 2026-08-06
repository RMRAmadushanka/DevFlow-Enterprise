"use client";

import { useParams } from "next/navigation";

import { DocumentDetailShell } from "@/features/documents";

export default function DocumentDetailPage() {
  const params = useParams<{ documentId: string }>();
  return <DocumentDetailShell documentId={params.documentId} />;
}
