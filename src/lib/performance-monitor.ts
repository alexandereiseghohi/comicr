import { type NextRequest } from "next/server";

import { logger } from "./enhanced-logger";

export interface PerformanceMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  responseTime: number;
  route?: string;
  statusCode?: number;
  timestamp: string;
  userAgent?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(): () => PerformanceMetrics {
    const startTime = Date.now();

    return () => {
      const responseTime = Date.now() - startTime;
      const memoryUsage = process.memoryUsage();

      const metrics: PerformanceMetrics = {
        responseTime,
        memoryUsage,
        timestamp: new Date().toISOString(),
      };

      this.recordMetrics(metrics);

      // Log slow requests
      if (responseTime > 1000) {
        logger.performanceWarn("Slow request detected", {
          metadata: { responseTime, memoryUsage },
        });
      }

      return metrics;
    };
  }

  recordMetrics(metrics: PerformanceMetrics) {
    this.metrics.push(metrics);

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getAverageResponseTime(minutes: number = 5): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter((m) => new Date(m.timestamp) > cutoff);

    if (recentMetrics.length === 0) return 0;

    const total = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return total / recentMetrics.length;
  }

  getSlowRequests(threshold: number = 1000): PerformanceMetrics[] {
    return this.metrics.filter((m) => m.responseTime > threshold);
  }

  createMiddleware() {
    return (req: NextRequest, res: unknown, next: () => void) => {
      const endTimer = this.startTimer();

      // Add route info if available
      const timer = () => {
        const metrics = endTimer();
        metrics.route = req.url;
        metrics.statusCode = (res as { status?: number }).status;
        metrics.userAgent = req.headers.get("user-agent") || undefined;

        logger.performance("Request completed", {
          url: req.url,
          method: req.method,
          metadata: { ...metrics },
        });
      };

      // Handle both callback and promise patterns
      if (next) {
        (res as { on?: (event: string, handler: () => void) => void }).on?.("finish", timer);
        next();
      } else {
        return timer;
      }
    };
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Web Vitals tracking for client-side
export function trackWebVitals() {
  if (typeof window === "undefined") return;

  // Core Web Vitals tracking
  if ("web-vital" in window) {
    // @ts-expect-error - web-vital types not available
    window["web-vital"].getCLS(onVitalCollected);
    // @ts-expect-error - web-vital types not available
    window["web-vital"].getFID(onVitalCollected);
    // @ts-expect-error - web-vital types not available
    window["web-vital"].getFCP(onVitalCollected);
    // @ts-expect-error - web-vital types not available
    window["web-vital"].getLCP(onVitalCollected);
    // @ts-expect-error - web-vital types not available
    window["web-vital"].getTTFB(onVitalCollected);
  }

  // Custom performance observers
  if ("PerformanceObserver" in window) {
    // Long task observer
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logger.performanceWarn("Long task detected", {
            metadata: {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            },
          });
        }
      });
      longTaskObserver.observe({ entryTypes: ["longtask"] });
    } catch (_) {
      // Ignore if not supported
    }

    // Largest contentful paint observer
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logger.performance("LCP measured", {
            metadata: {
              startTime: entry.startTime,
              element:
                typeof entry === "object" && entry && "target" in entry && (entry as any).target
                  ? (entry as any).target.tagName
                  : undefined,
            },
          });
        }
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (_) {
      // Ignore if not supported
    }
  }
}

function onVitalCollected(metric: { delta: number; name: string; rating: string; value: number }) {
  logger.performance(`Web Vital: ${metric.name}`, {
    metadata: {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    },
  });
}

export default performanceMonitor;
