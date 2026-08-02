"use client";

import * as React from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { iconSize } from "@/design-system/tokens/icons";

export interface ErrorFallbackProps {
  error: Error;
  onRetry: () => void;
}

function DefaultErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-muted text-danger">
        <TriangleAlert size={iconSize.lg} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <Text variant="title" as="h1">
          Something went wrong
        </Text>
        <Text tone="secondary" className="max-w-md">
          {error.message || "An unexpected error occurred while rendering this page."}
        </Text>
      </div>
      <Button onClick={onRetry}>
        <RefreshCw size={iconSize.xs} /> Try again
      </Button>
    </div>
  );
}

export interface ErrorBoundaryLayoutProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryLayoutState {
  error: Error | null;
}

/**
 * Catches render errors anywhere within the application shell (or a
 * single page) and renders a full-screen fallback instead of a blank
 * white page. This must be a class component — React only supports
 * error boundaries via `getDerivedStateFromError`/`componentDidCatch`,
 * there is no hook equivalent.
 */
export class ErrorBoundaryLayout extends React.Component<
  ErrorBoundaryLayoutProps,
  ErrorBoundaryLayoutState
> {
  state: ErrorBoundaryLayoutState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryLayoutState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const Fallback = this.props.fallback ?? DefaultErrorFallback;
    return <Fallback error={error} onRetry={this.handleRetry} />;
  }
}
