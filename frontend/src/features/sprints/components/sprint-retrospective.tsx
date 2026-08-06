"use client";

import * as React from "react";
import { MessageSquare, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextareaField } from "@/components/forms/textarea";
import { cn } from "@/lib/utils";

import type { RetroItem, SprintRetrospective as SprintRetrospectiveData } from "../types/sprint.types";

export interface SprintRetrospectiveProps {
  retrospective: SprintRetrospectiveData;
  className?: string;
}

function RetroColumn({
  title,
  items,
  onVote,
}: {
  title: string;
  items: RetroItem[];
  onVote?: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-2 rounded-md border border-border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm">{item.text}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.authorName}</p>
              </div>
              {onVote ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="shrink-0 tabular-nums"
                  onClick={() => onVote(item.id)}
                >
                  <ThumbsUp className="size-3.5" />
                  {item.votes}
                </Button>
              ) : (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {item.votes} votes
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SprintRetrospective({ retrospective, className }: SprintRetrospectiveProps) {
  const [comment, setComment] = React.useState("");
  const [localRetro, setLocalRetro] = React.useState(retrospective);

  React.useEffect(() => {
    setLocalRetro(retrospective);
  }, [retrospective]);

  function handleVote(column: "wentWell" | "needsImprovement" | "actionItems", id: string) {
    setLocalRetro((prev) => ({
      ...prev,
      [column]: prev[column].map((item) =>
        item.id === id ? { ...item, votes: item.votes + 1 } : item
      ),
    }));
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} data-slot="sprint-retrospective">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Went well</CardTitle>
          </CardHeader>
          <CardContent>
            <RetroColumn
              title=""
              items={localRetro.wentWell}
              onVote={(id) => handleVote("wentWell", id)}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Needs improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <RetroColumn
              title=""
              items={localRetro.needsImprovement}
              onVote={(id) => handleVote("needsImprovement", id)}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Action items</CardTitle>
          </CardHeader>
          <CardContent>
            <RetroColumn
              title=""
              items={localRetro.actionItems}
              onVote={(id) => handleVote("actionItems", id)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="size-4 text-muted-foreground" aria-hidden />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {localRetro.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {localRetro.comments.map((entry) => (
                <li key={entry.id} className="rounded-md border border-border px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{entry.authorName}</span>
                    <time className="text-xs text-muted-foreground">{entry.timestamp}</time>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.body}</p>
                </li>
              ))}
            </ul>
          )}
          <TextareaField
            label="Add comment"
            value={comment}
            onChange={setComment}
            placeholder="Share feedback with the team…"
            rows={3}
          />
          <Button type="button" size="sm" disabled={!comment.trim()}>
            Post comment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export { SprintRetrospective };
