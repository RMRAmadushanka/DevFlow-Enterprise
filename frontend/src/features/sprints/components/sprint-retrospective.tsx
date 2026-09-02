"use client";

import * as React from "react";
import { MessageSquare, Plus, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextInput } from "@/components/forms/input";
import { TextareaField } from "@/components/forms/textarea";
import { cn } from "@/lib/utils";

import {
  useCreateRetroItem,
  usePostRetroComment,
  useVoteRetroItem,
} from "../hooks/use-sprints";
import type { RetroItem, SprintRetrospective as SprintRetrospectiveData } from "../types/sprint.types";

export interface SprintRetrospectiveProps {
  retrospective: SprintRetrospectiveData;
  sprintId: string;
  className?: string;
}

type RetroColumn = "wentWell" | "needsImprovement" | "actionItems";

const COLUMN_TO_API: Record<RetroColumn, "WENT_WELL" | "NEEDS_IMPROVEMENT" | "ACTION_ITEM"> = {
  wentWell: "WENT_WELL",
  needsImprovement: "NEEDS_IMPROVEMENT",
  actionItems: "ACTION_ITEM",
};

function RetroColumnView({
  title,
  items,
  onVote,
  onAdd,
  adding,
}: {
  title: string;
  items: RetroItem[];
  onVote?: (id: string) => void;
  onAdd?: (text: string) => void;
  adding?: boolean;
}) {
  const [draft, setDraft] = React.useState("");

  return (
    <div className="flex flex-col gap-2">
      {title ? <h4 className="text-sm font-semibold">{title}</h4> : null}
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
                  variant={item.votedByCurrentUser ? "secondary" : "ghost"}
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
      {onAdd ? (
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = draft.trim();
            if (!trimmed) return;
            onAdd(trimmed);
            setDraft("");
          }}
        >
          <TextInput
            value={draft}
            onChange={setDraft}
            placeholder="Add an item…"
            className="flex-1"
          />
          <Button type="submit" size="icon-sm" variant="outline" disabled={!draft.trim() || adding}>
            <Plus className="size-3.5" />
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function SprintRetrospective({ retrospective, sprintId, className }: SprintRetrospectiveProps) {
  const [comment, setComment] = React.useState("");
  const createItem = useCreateRetroItem(sprintId);
  const voteItem = useVoteRetroItem(sprintId);
  const postComment = usePostRetroComment(sprintId);

  function handleAdd(column: RetroColumn, text: string) {
    void createItem.mutateAsync({ columnType: COLUMN_TO_API[column], text });
  }

  function handleVote(id: string) {
    void voteItem.mutateAsync(id);
  }

  function handlePostComment() {
    const trimmed = comment.trim();
    if (!trimmed) return;
    postComment.mutate(trimmed, {
      onSuccess: () => setComment(""),
    });
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} data-slot="sprint-retrospective">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Went well</CardTitle>
          </CardHeader>
          <CardContent>
            <RetroColumnView
              title=""
              items={retrospective.wentWell}
              onVote={handleVote}
              onAdd={(text) => handleAdd("wentWell", text)}
              adding={createItem.isPending}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Needs improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <RetroColumnView
              title=""
              items={retrospective.needsImprovement}
              onVote={handleVote}
              onAdd={(text) => handleAdd("needsImprovement", text)}
              adding={createItem.isPending}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Action items</CardTitle>
          </CardHeader>
          <CardContent>
            <RetroColumnView
              title=""
              items={retrospective.actionItems}
              onVote={handleVote}
              onAdd={(text) => handleAdd("actionItems", text)}
              adding={createItem.isPending}
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
          {retrospective.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {retrospective.comments.map((entry) => (
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
          <Button
            type="button"
            size="sm"
            disabled={!comment.trim() || postComment.isPending}
            onClick={handlePostComment}
          >
            {postComment.isPending ? "Posting…" : "Post comment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export { SprintRetrospective };
