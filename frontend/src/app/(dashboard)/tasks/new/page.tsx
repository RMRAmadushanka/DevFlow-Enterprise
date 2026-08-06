"use client";

import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { TaskForm } from "@/features/tasks";

export default function NewTaskPage() {
  return (
    <PageContainer className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Create task"
        description="Capture work with status, priority, and ownership."
        breadcrumbs={[
          { label: "Tasks", href: routes.app.tasks },
          { label: "New" },
        ]}
        actions={
          <Button render={<Link href={routes.app.tasks} />} variant="outline">
            Cancel
          </Button>
        }
      />
      <TaskForm mode="create" />
    </PageContainer>
  );
}
