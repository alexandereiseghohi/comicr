"use client";

import { Component, type ReactNode, Suspense } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  children: ReactNode;
  errorMessage?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  isLoading: boolean;
}

class LoadingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isLoading: false };
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true, isLoading: false };
  }

  public componentDidCatch(error: Error) {
    console.error("Loading error boundary caught an error:", error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, isLoading: true });
    // Simulate loading delay
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 100);
  };

  private renderFallback() {
    return (
      this.props.fallback || (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )
    );
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Loading Error</AlertTitle>
          <AlertDescription className="mt-2">
            {this.props.errorMessage || "Failed to load content."}
            <Button className="ml-2" onClick={this.handleRetry} size="sm" variant="outline">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (this.state.isLoading) {
      return this.renderFallback();
    }

    return <Suspense fallback={this.renderFallback()}>{this.props.children}</Suspense>;
  }
}

export default LoadingErrorBoundary;
