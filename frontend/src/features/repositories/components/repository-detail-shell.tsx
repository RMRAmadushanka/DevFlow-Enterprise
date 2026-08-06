"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { DetailPageTemplate } from "@/components/layout/page-templates";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { REPOSITORY_DETAIL_TABS } from "../constants/repository.constants";
import { useRepository } from "../hooks/use-repositories";
import type { Repository as RepositoryEntity } from "../types/repository.types";
import { ArchiveRepositoryModal } from "./archive-repository-modal";
import { BranchList } from "./branch-list";
import { CodeBrowser } from "./code-browser";
import { CommitList } from "./commit-list";
import { DeleteRepositoryModal } from "./delete-repository-modal";
import { PullRequestList } from "./pull-request-list";
import { ReadmeViewer } from "./readme-viewer";
import { ReleaseList } from "./release-list";
import { RepositoryHeader } from "./repository-header";
import { RepositoryMembers } from "./repository-members";
import { RepositoryOverview } from "./repository-overview";
import { RepositoryPermissions } from "./repository-permissions";
import { RepositorySettings } from "./repository-settings";
import { RepositorySkeleton } from "./repository-skeleton";
import { TagList } from "./tag-list";
import { TransferRepositoryModal } from "./transfer-repository-modal";
import { WebhookList } from "./webhook-list";

export interface RepositoryDetailShellProps {
  repositoryId: string;
}

function getActiveTab(pathname: string, repositoryId: string): string {
  const base = `/repositories/${repositoryId}`;
  if (pathname.startsWith(`${base}/settings`)) return "settings";
  if (pathname.startsWith(`${base}/files`)) return "files";
  if (pathname.startsWith(`${base}/branches`)) return "branches";
  if (pathname.startsWith(`${base}/commits`)) return "commits";
  if (pathname.startsWith(`${base}/pull-requests`)) return "pull-requests";
  if (pathname.startsWith(`${base}/releases`)) return "releases";
  if (pathname.startsWith(`${base}/webhooks`)) return "webhooks";
  if (pathname.includes("/members")) return "members";
  return "overview";
}

function tabHref(repositoryId: string, value: string): string {
  switch (value) {
    case "overview":
      return routes.app.repository(repositoryId);
    case "files":
      return routes.app.repositoryFiles(repositoryId);
    case "branches":
      return routes.app.repositoryBranches(repositoryId);
    case "commits":
      return routes.app.repositoryCommits(repositoryId);
    case "pull-requests":
      return routes.app.repositoryPullRequests(repositoryId);
    case "releases":
      return routes.app.repositoryReleases(repositoryId);
    case "webhooks":
      return routes.app.repositoryWebhooks(repositoryId);
    case "settings":
      return routes.app.repositorySettings(repositoryId);
    default:
      return `${routes.app.repository(repositoryId)}/${value}`;
  }
}

function RepositoryDetailShell({ repositoryId }: RepositoryDetailShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: repository, isLoading, isError } = useRepository(repositoryId);

  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [transferOpen, setTransferOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const activeTab = getActiveTab(pathname, repositoryId);

  const tabs = React.useMemo(
    () =>
      REPOSITORY_DETAIL_TABS.map((tab) => ({
        ...tab,
        href: tabHref(repositoryId, tab.value),
      })),
    [repositoryId]
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <RepositorySkeleton />
      </div>
    );
  }

  if (isError || !repository) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Repository not found"
        description="This repository may have been deleted or you no longer have access."
        action={
          <Button render={<Link href={routes.app.repositories} />}>
            Back to repositories
          </Button>
        }
      />
    );
  }

  const openArchive = (_repo: RepositoryEntity) => setArchiveOpen(true);
  const openTransfer = (_repo: RepositoryEntity) => setTransferOpen(true);
  const openDelete = (_repo: RepositoryEntity) => setDeleteOpen(true);

  return (
    <>
      <DetailPageTemplate
        title={repository.fullName || repository.name}
        description={repository.description}
        breadcrumbs={[
          { label: "Repositories", href: routes.app.repositories },
          { label: repository.name },
        ]}
        tabs={tabs.map(({ value, label }) => ({ value, label }))}
        activeTab={activeTab}
        onTabChange={(value) => {
          const next = tabs.find((tab) => tab.value === value);
          if (next) router.push(next.href);
        }}
      >
        <div className="flex flex-col gap-6">
          <RepositoryHeader
            repository={repository}
            mode="detail"
            onArchive={openArchive}
            onTransfer={openTransfer}
            onDelete={openDelete}
          />

          {activeTab === "overview" ? (
            <>
              <RepositoryOverview repository={repository} />
              <ReadmeViewer html={repository.readmeHtml} />
            </>
          ) : null}

          {activeTab === "files" ? <CodeBrowser repositoryId={repositoryId} /> : null}

          {activeTab === "branches" ? <BranchList repositoryId={repositoryId} /> : null}

          {activeTab === "commits" ? <CommitList repositoryId={repositoryId} /> : null}

          {activeTab === "pull-requests" ? (
            <PullRequestList repositoryId={repositoryId} />
          ) : null}

          {activeTab === "releases" ? (
            <div className="flex flex-col gap-6">
              <ReleaseList repositoryId={repositoryId} />
              <TagList repositoryId={repositoryId} />
            </div>
          ) : null}

          {activeTab === "members" ? (
            <div className="flex flex-col gap-6">
              <RepositoryMembers members={repository.members} />
              <RepositoryPermissions />
            </div>
          ) : null}

          {activeTab === "webhooks" ? <WebhookList repositoryId={repositoryId} /> : null}

          {activeTab === "settings" ? (
            <RepositorySettings repository={repository} />
          ) : null}
        </div>
      </DetailPageTemplate>

      <ArchiveRepositoryModal
        repository={repository}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
      />
      <TransferRepositoryModal
        repository={repository}
        open={transferOpen}
        onOpenChange={setTransferOpen}
      />
      <DeleteRepositoryModal
        repository={repository}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

export { RepositoryDetailShell };
