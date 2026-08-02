"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { EmptyWorkspaceState, ErrorBoundaryLayout, LoadingLayout } from "@/components/layout/layouts";
import { PageContainer } from "@/components/layout/page-container/page-container";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Boom } from "./boom";

const demoCards = [
  { title: "Open tasks", value: "24" },
  { title: "Active deployments", value: "3" },
  { title: "Repositories", value: "12" },
];

/**
 * Internal harness page — demonstrates `PageHeader`, `PageContainer`,
 * and the four layout states (content / loading / empty / error) side
 * by side. Not a feature page: no data fetching, no business logic.
 */
export default function ShellPreviewPage() {
  const [throwError, setThrowError] = React.useState(false);

  return (
    <Tabs defaultValue="content" className="gap-0">
      <div className="border-b border-border px-4 sm:px-6">
        <TabsList variant="line" className="h-11 bg-transparent p-0">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="loading">Loading state</TabsTrigger>
          <TabsTrigger value="empty">Empty state</TabsTrigger>
          <TabsTrigger value="error">Error state</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="content">
        <PageContainer>
          <PageHeader
            title="Layout Preview"
            description="A harness for the reusable application shell — sidebar, navbar, command menu, and page primitives."
            actions={
              <Button>
                <Plus /> Create Project
              </Button>
            }
          />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoCards.map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <CardTitle className="text-sm text-text-secondary">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-text-primary">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageContainer>
      </TabsContent>

      <TabsContent value="loading">
        <LoadingLayout />
      </TabsContent>

      <TabsContent value="empty">
        <PageContainer>
          <EmptyWorkspaceState onAction={() => {}} />
        </PageContainer>
      </TabsContent>

      <TabsContent value="error">
        <PageContainer>
          <div className="mb-4">
            <Button variant="outline" onClick={() => setThrowError((v) => !v)}>
              {throwError ? "Reset" : "Trigger render error"}
            </Button>
          </div>
          <ErrorBoundaryLayout key={String(throwError)}>
            <Boom shouldThrow={throwError} />
            <p className="text-sm text-text-secondary">
              No error triggered — click the button above to simulate one.
            </p>
          </ErrorBoundaryLayout>
        </PageContainer>
      </TabsContent>
    </Tabs>
  );
}
