#!/usr/bin/env tsx
/**
 * setup-error-boundaries.ts - React Error Boundaries Implementation
 * Creates comprehensive error boundary components and global error handling
 * Integrates with existing Sentry configuration
 */
import fs from "node:fs/promises";
import path from "node:path";

// Color utilities
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

// Error boundary component template
const ERROR_BOUNDARY_COMPONENT = `"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Report to Sentry
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    this.setState({ eventId });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && this.props.showErrorDetails && (
                <details className="rounded-md bg-gray-100 p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-gray-900">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 space-y-2 text-xs text-gray-600">
                    <div>
                      <strong>Error:</strong> {this.state.error?.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 overflow-auto">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                    {this.state.eventId && (
                      <div>
                        <strong>Event ID:</strong> {this.state.eventId}
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorBoundary() {
  return (error: Error) => {
    throw error;
  };
}`;

// Simple error boundary for minimal UI
const SIMPLE_ERROR_BOUNDARY = `"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface SimpleErrorBoundaryProps {
  children: ReactNode;
  message?: string;
}

interface SimpleErrorBoundaryState {
  hasError: boolean;
}

export class SimpleErrorBoundary extends Component<
  SimpleErrorBoundaryProps,
  SimpleErrorBoundaryState
> {
  constructor(props: SimpleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SimpleErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("SimpleErrorBoundary caught an error:", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">
            {this.props.message || "Something went wrong with this component"}
          </span>
        </div>
      );
    }

    return this.props.children;
  }
}`;

// Global error handler for Next.js
const GLOBAL_ERROR_PAGE = `"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Report error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Application Error</CardTitle>
              <CardDescription>
                A critical error occurred. Our team has been notified and is working on a fix.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && (
                <details className="rounded-md bg-gray-100 p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-gray-900">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 space-y-2 text-xs text-gray-600">
                    <div>
                      <strong>Message:</strong> {error.message}
                    </div>
                    {error.digest && (
                      <div>
                        <strong>Digest:</strong> {error.digest}
                      </div>
                    )}
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 overflow-auto whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              <div className="flex gap-2">
                <Button onClick={reset} variant="outline" className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={() => window.location.href = "/"} className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}`;

// Loading error boundary for suspense fallbacks
const LOADING_ERROR_BOUNDARY = `"use client";

import { Component, type ReactNode, Suspense } from "react";
import { Loader2 } from "lucide-react";

interface LoadingErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

interface LoadingErrorBoundaryState {
  hasError: boolean;
}

export class LoadingErrorBoundary extends Component<
  LoadingErrorBoundaryProps,
  LoadingErrorBoundaryState
> {
  constructor(props: LoadingErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): LoadingErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("LoadingErrorBoundary caught an error:", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
            Failed to load component
          </div>
        )
      );
    }

    const loadingFallback = this.props.loadingFallback || (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    );

    return (
      <Suspense fallback={loadingFallback}>
        {this.props.children}
      </Suspense>
    );
  }
}`;

// Utility functions for error reporting
const ERROR_UTILS = `import * as Sentry from "@sentry/nextjs";

export interface ErrorContext {
  userId?: string;
  page?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, unknown>;
}

export function reportError(error: Error, context?: ErrorContext) {
  // Report to Sentry with context
  Sentry.withScope((scope) => {
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }

    if (context?.page) {
      scope.setTag("page", context.page);
    }

    if (context?.component) {
      scope.setTag("component", context.component);
    }

    if (context?.action) {
      scope.setTag("action", context.action);
    }

    if (context?.additionalData) {
      scope.setContext("additionalData", context.additionalData);
    }

    Sentry.captureException(error);
  });

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error reported:", error, context);
  }
}

export function reportWarning(message: string, context?: ErrorContext) {
  Sentry.withScope((scope) => {
    scope.setLevel("warning");

    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }

    if (context?.page) {
      scope.setTag("page", context.page);
    }

    if (context?.component) {
      scope.setTag("component", context.component);
    }

    if (context?.additionalData) {
      scope.setContext("additionalData", context.additionalData);
    }

    Sentry.captureMessage(message);
  });

  if (process.env.NODE_ENV === "development") {
    console.warn("Warning reported:", message, context);
  }
}

export class AsyncErrorBoundary {
  static async wrapAsync<T>(
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      reportError(error as Error, context);
      return null;
    }
  }
}`;

async function setupErrorBoundaries() {
  log.info("🛡️ Setting up React Error Boundaries...");

  try {
    const componentsDir = path.join(process.cwd(), "src", "components", "ui");
    const appDir = path.join(process.cwd(), "src", "app");
    const libDir = path.join(process.cwd(), "src", "lib");

    // Ensure directories exist
    await fs.mkdir(componentsDir, { recursive: true });
    await fs.mkdir(path.join(libDir, "errors"), { recursive: true });

    // Create error boundary components
    log.info("Creating error boundary components...");

    const errorBoundaryPath = path.join(componentsDir, "error-boundary.tsx");
    await fs.writeFile(errorBoundaryPath, ERROR_BOUNDARY_COMPONENT);
    log.success("✓ Created ErrorBoundary component");

    const simpleErrorBoundaryPath = path.join(componentsDir, "simple-error-boundary.tsx");
    await fs.writeFile(simpleErrorBoundaryPath, SIMPLE_ERROR_BOUNDARY);
    log.success("✓ Created SimpleErrorBoundary component");

    const loadingErrorBoundaryPath = path.join(componentsDir, "loading-error-boundary.tsx");
    await fs.writeFile(loadingErrorBoundaryPath, LOADING_ERROR_BOUNDARY);
    log.success("✓ Created LoadingErrorBoundary component");

    // Create global error page
    log.info("Creating global error page...");
    const globalErrorPath = path.join(appDir, "global-error.tsx");
    await fs.writeFile(globalErrorPath, GLOBAL_ERROR_PAGE);
    log.success("✓ Created global error page");

    // Create error utilities
    log.info("Creating error utilities...");
    const errorUtilsPath = path.join(libDir, "errors", "error-utils.ts");
    await fs.writeFile(errorUtilsPath, ERROR_UTILS);
    log.success("✓ Created error utilities");

    // Update components index to export error boundaries
    log.info("Updating component exports...");
    const componentIndexPath = path.join(componentsDir, "index.ts");

    let indexContent = "";
    try {
      indexContent = await fs.readFile(componentIndexPath, "utf-8");
    } catch {
      log.info("Creating new UI components index file...");
    }

    const errorBoundaryExports = `
// Error Boundaries
export { ErrorBoundary } from './error-boundary';
export { SimpleErrorBoundary } from './simple-error-boundary';
export { LoadingErrorBoundary } from './loading-error-boundary';
`;

    if (!indexContent.includes("error-boundary")) {
      indexContent += errorBoundaryExports;
      await fs.writeFile(componentIndexPath, indexContent);
      log.success("✓ Updated component exports");
    } else {
      log.info("✓ Component exports already up to date");
    }

    // Create error utilities index
    const errorIndexPath = path.join(libDir, "errors", "index.ts");
    const errorIndexContent = `export * from './error-utils';
`;
    await fs.writeFile(errorIndexPath, errorIndexContent);
    log.success("✓ Created error utilities index");

    log.success("🎉 Error Boundaries setup completed successfully!");
    log.info("Available components:");
    log.info("  • ErrorBoundary - Full-featured error boundary with Sentry integration");
    log.info("  • SimpleErrorBoundary - Minimal inline error display");
    log.info("  • LoadingErrorBoundary - Combines Suspense with error handling");
    log.info("  • Global Error Page - Handles application-level errors");
    log.info("  • Error Utils - Helper functions for error reporting");
  } catch (error) {
    log.error(`Error boundaries setup failed: ${error}`);
    throw error;
  }
}

// Execute when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupErrorBoundaries().catch(console.error);
}

export default setupErrorBoundaries;
