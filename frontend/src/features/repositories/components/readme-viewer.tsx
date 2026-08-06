"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ReadmeViewerProps {
  html?: string;
  markdown?: string;
  title?: string;
}

function ReadmeViewer({
  html,
  markdown,
  title = "README",
}: ReadmeViewerProps) {
  if (!html && !markdown) {
    return (
      <Card data-slot="readme-viewer">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">No README found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-slot="readme-viewer">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {html ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-foreground">{markdown}</pre>
        )}
      </CardContent>
    </Card>
  );
}

export { ReadmeViewer };
