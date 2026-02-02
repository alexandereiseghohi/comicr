#!/usr/bin/env tsx
/**
 * optimize-performance.ts - Performance Optimization Suite
 * Implements bundle analysis, image optimization, database query optimization,
 * caching strategies, and performance monitoring
 */
import { execSync } from "node:child_process";
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

// Performance packages
const PERFORMANCE_PACKAGES = [
  "@next/bundle-analyzer",
  "sharp",
  "compression",
  "lru-cache",
  "@vercel/speed-insights",
  "web-vitals",
];

// Bundle analyzer configuration
const BUNDLE_ANALYZER_CONFIG = `/** @type {import('@next/bundle-analyzer')} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-button',
      '@radix-ui/react-card',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-form',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-icons',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-sheet',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-table',
      '@radix-ui/react-tabs',
      '@radix-ui/react-textarea',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-tooltip',
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,

  // Bundle optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Tree shaking optimization
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };

    return config;
  },

  // Source maps in production (optional)
  productionBrowserSourceMaps: process.env.ENABLE_SOURCE_MAPS === 'true',

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);`;

// Performance monitoring utilities
const PERFORMANCE_MONITOR = `import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

export interface PerformanceMetrics {
  cls: number | null;
  fid: number | null;
  fcp: number | null;
  lcp: number | null;
  ttfb: number | null;
  timestamp: number;
  url: string;
  userAgent: string;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
    }
  }

  private initializeWebVitals() {
    const handleMetric = (metric: Metric) => {
      this.metrics[metric.name.toLowerCase() as keyof PerformanceMetrics] = metric.value;
      this.reportMetrics();
    };

    // Collect all Web Vitals
    getCLS(handleMetric);
    getFID(handleMetric);
    getFCP(handleMetric);
    getLCP(handleMetric);
    getTTFB(handleMetric);

    // Report when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportMetrics();
      }
    });

    // Report before page unload
    window.addEventListener('beforeunload', () => {
      this.reportMetrics();
    });
  }

  private reportMetrics() {
    const completeMetrics: PerformanceMetrics = {
      cls: this.metrics.cls || null,
      fid: this.metrics.fid || null,
      fcp: this.metrics.fcp || null,
      lcp: this.metrics.lcp || null,
      ttfb: this.metrics.ttfb || null,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Call all registered callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(completeMetrics);
      } catch (error) {
        console.error('Performance monitor callback error:', error);
      }
    });
  }

  public onMetrics(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.push(callback);
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  // Manual performance measurements
  public measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    console.log(\`Performance: \${name} took \${duration.toFixed(2)}ms\`);

    // You can send this to your analytics service
    this.reportCustomMetric(name, duration);

    return result;
  }

  public async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    console.log(\`Performance: \${name} took \${duration.toFixed(2)}ms\`);

    this.reportCustomMetric(name, duration);

    return result;
  }

  private reportCustomMetric(name: string, value: number) {
    // Send to analytics (implement based on your needs)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // Google Analytics 4
      (window as any).gtag('event', 'timing_complete', {
        name,
        value: Math.round(value),
      });
    }

    // Send to Vercel Speed Insights
    if (typeof window !== 'undefined' && 'webVitals' in window) {
      (window as any).webVitals.reportWebVitals({
        name,
        value,
        rating: value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor',
      });
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    measureFunction: performanceMonitor.measureFunction.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    onMetrics: performanceMonitor.onMetrics.bind(performanceMonitor),
  };
}`;

// Database query optimization utilities
const DB_PERFORMANCE = `import { db } from '@/database/db';
import { sql } from 'drizzle-orm';

interface QueryStats {
  query: string;
  duration: number;
  rows: number;
  timestamp: number;
}

class DatabasePerformance {
  private queryLog: QueryStats[] = [];
  private slowQueryThreshold = 100; // ms

  // Monitor query performance
  public async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await queryFn();
      const duration = performance.now() - start;
      const rows = Array.isArray(result) ? result.length : 1;

      const stats: QueryStats = {
        query: queryName,
        duration,
        rows,
        timestamp: Date.now(),
      };

      this.queryLog.push(stats);

      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        console.warn(\`Slow query detected: \${queryName} took \${duration.toFixed(2)}ms\`);
      }

      // Keep only recent queries (last 100)
      if (this.queryLog.length > 100) {
        this.queryLog = this.queryLog.slice(-100);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(\`Query error: \${queryName} failed after \${duration.toFixed(2)}ms\`, error);
      throw error;
    }
  }

  // Get database connection stats
  public async getConnectionStats() {
    try {
      const stats = await db.execute(sql\`
        SELECT
          count(*) as total_connections,
          count(*) filter (where state = 'active') as active_connections,
          count(*) filter (where state = 'idle') as idle_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      \`);

      return stats[0];
    } catch (error) {
      console.error('Failed to get connection stats:', error);
      return null;
    }
  }

  // Analyze slow queries
  public getSlowQueries(threshold = this.slowQueryThreshold): QueryStats[] {
    return this.queryLog
      .filter(stat => stat.duration > threshold)
      .sort((a, b) => b.duration - a.duration);
  }

  // Get query performance summary
  public getPerformanceSummary() {
    if (this.queryLog.length === 0) {
      return null;
    }

    const durations = this.queryLog.map(stat => stat.duration);
    const totalQueries = this.queryLog.length;
    const slowQueries = this.queryLog.filter(stat => stat.duration > this.slowQueryThreshold).length;

    return {
      totalQueries,
      slowQueries,
      slowQueryPercentage: (slowQueries / totalQueries) * 100,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
    };
  }

  // Database optimization suggestions
  public async getDatabaseOptimizationSuggestions() {
    const suggestions = [];

    try {
      // Check for missing indexes
      const missingIndexes = await db.execute(sql\`
        SELECT
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats
        WHERE schemaname = 'public'
        AND n_distinct > 100
        AND correlation < 0.1
      \`);

      if (missingIndexes.length > 0) {
        suggestions.push({
          type: 'missing_indexes',
          message: 'Consider adding indexes to frequently queried columns',
          details: missingIndexes,
        });
      }

      // Check table sizes
      const tableSizes = await db.execute(sql\`
        SELECT
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      \`);

      if (tableSizes.length > 0) {
        suggestions.push({
          type: 'table_sizes',
          message: 'Monitor large tables for performance impact',
          details: tableSizes,
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Failed to get optimization suggestions:', error);
      return [];
    }
  }
}

export const dbPerformance = new DatabasePerformance();

// Drizzle query wrapper for automatic performance monitoring
export function withPerformanceMonitoring<T>(queryName: string) {
  return (queryFn: () => Promise<T>): Promise<T> => {
    return dbPerformance.measureQuery(queryName, queryFn);
  };
}

// Example usage:
// const users = await withPerformanceMonitoring('getUsersByRole')(() =>
//   db.select().from(user).where(eq(user.role, 'admin'))
// );`;

// Caching utilities
const CACHING_UTILS = `import { LRUCache } from 'lru-cache';

interface CacheOptions {
  maxSize?: number;
  ttl?: number; // in milliseconds
}

class AppCache {
  private cache: LRUCache<string, any>;

  constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache({
      max: options.maxSize || 500,
      ttl: options.ttl || 1000 * 60 * 5, // 5 minutes default
    });
  }

  set(key: string, value: any, ttl?: number): void {
    this.cache.set(key, value, { ttl });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cache with function memoization
  async memoize<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    if (this.has(key)) {
      return this.get(key);
    }

    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      max: this.cache.max,
      hits: this.cache.calculatedSize,
    };
  }
}

// Global cache instances
export const queryCache = new AppCache({
  maxSize: 1000,
  ttl: 1000 * 60 * 10, // 10 minutes
});

export const apiCache = new AppCache({
  maxSize: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export const userCache = new AppCache({
  maxSize: 100,
  ttl: 1000 * 60 * 30, // 30 minutes
});

// Cache keys generator
export const cacheKeys = {
  user: (id: string) => \`user:\${id}\`,
  comic: (id: string) => \`comic:\${id}\`,
  chapter: (id: string) => \`chapter:\${id}\`,
  userComics: (userId: string, page: number) => \`user_comics:\${userId}:\${page}\`,
  trendingComics: (limit: number) => \`trending_comics:\${limit}\`,
  searchResults: (query: string, page: number) => \`search:\${query}:\${page}\`,
};

// React hook for caching
export function useCache(cache = queryCache) {
  return {
    get: cache.get.bind(cache),
    set: cache.set.bind(cache),
    has: cache.has.bind(cache),
    delete: cache.delete.bind(cache),
    memoize: cache.memoize.bind(cache),
    getStats: cache.getStats.bind(cache),
  };
}`;

async function optimizePerformance() {
  log.info("🚀 Setting up performance optimization suite...");

  try {
    // Install performance packages
    log.info("Installing performance packages...");
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

    const packagesToInstall = PERFORMANCE_PACKAGES.filter((pkg) => {
      const hasPackage = packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg];
      if (!hasPackage) {
        log.info(`  - Adding: ${pkg}`);
        return true;
      } else {
        log.info(`  ✓ Already installed: ${pkg}`);
        return false;
      }
    });

    if (packagesToInstall.length > 0) {
      const installCommand = `pnpm add ${packagesToInstall.join(" ")}`;
      log.info(`Running: ${installCommand}`);
      execSync(installCommand, { stdio: "inherit" });
      log.success("Performance packages installed");
    } else {
      log.success("All performance packages already installed");
    }

    // Create performance utilities directory
    const perfDir = path.join(process.cwd(), "src", "lib", "performance");
    await fs.mkdir(perfDir, { recursive: true });

    // Update Next.js configuration with bundle analyzer
    log.info("Updating Next.js configuration...");
    const nextConfigPath = path.join(process.cwd(), "next.config.ts");

    // Backup existing config
    try {
      const existingConfig = await fs.readFile(nextConfigPath, "utf-8");
      const backupPath = path.join(process.cwd(), "next.config.ts.backup");
      await fs.writeFile(backupPath, existingConfig);
      log.info(`Backed up existing config to: ${backupPath}`);
    } catch {
      log.info("No existing Next.js config found");
    }

    // Write optimized configuration
    await fs.writeFile(nextConfigPath, BUNDLE_ANALYZER_CONFIG);
    log.success("✓ Updated Next.js configuration with performance optimizations");

    // Create performance monitoring utilities
    log.info("Creating performance monitoring utilities...");

    const perfMonitorPath = path.join(perfDir, "monitor.ts");
    await fs.writeFile(perfMonitorPath, PERFORMANCE_MONITOR);
    log.success("✓ Created performance monitor");

    const dbPerfPath = path.join(perfDir, "database.ts");
    await fs.writeFile(dbPerfPath, DB_PERFORMANCE);
    log.success("✓ Created database performance utilities");

    const cachingPath = path.join(perfDir, "caching.ts");
    await fs.writeFile(cachingPath, CACHING_UTILS);
    log.success("✓ Created caching utilities");

    // Create performance index
    const indexContent = `export * from './monitor';
export * from './database';
export * from './caching';

// Re-export commonly used items
export { performanceMonitor, usePerformanceMonitor } from './monitor';
export { dbPerformance, withPerformanceMonitoring } from './database';
export { queryCache, apiCache, userCache, cacheKeys, useCache } from './caching';
`;
    const indexPath = path.join(perfDir, "index.ts");
    await fs.writeFile(indexPath, indexContent);
    log.success("✓ Created performance index");

    // Update package.json scripts
    log.info("Adding performance analysis scripts...");
    const updatedPackageJson = { ...packageJson };

    if (!updatedPackageJson.scripts) {
      updatedPackageJson.scripts = {};
    }

    const perfScripts = {
      analyze: "ANALYZE=true next build",
      "analyze:server": "BUNDLE_ANALYZE=server next build",
      "analyze:browser": "BUNDLE_ANALYZE=browser next build",
      "perf:audit": "npx lighthouse http://localhost:3000 --output html --output-path ./reports/lighthouse.html",
    };

    let scriptsUpdated = false;
    for (const [script, command] of Object.entries(perfScripts)) {
      if (!updatedPackageJson.scripts[script] || updatedPackageJson.scripts[script] !== command) {
        updatedPackageJson.scripts[script] = command;
        scriptsUpdated = true;
        log.info(`  ✓ Updated script: ${script}`);
      }
    }

    if (scriptsUpdated) {
      await fs.writeFile(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2));
      log.success("Package.json scripts updated");
    } else {
      log.success("Package.json scripts already up to date");
    }

    // Create reports directory
    const reportsDir = path.join(process.cwd(), "reports");
    await fs.mkdir(reportsDir, { recursive: true });

    const reportsGitignore = `# Performance reports
*.html
*.json
*.csv

# Keep directory structure
!.gitignore
`;
    await fs.writeFile(path.join(reportsDir, ".gitignore"), reportsGitignore);
    log.success("✓ Created reports directory");

    log.success("🎉 Performance optimization setup completed successfully!");
    log.info("Available features:");
    log.info('  • Bundle Analyzer - Run "pnpm analyze" to analyze bundle size');
    log.info("  • Performance Monitor - Web Vitals and custom metrics tracking");
    log.info("  • Database Performance - Query monitoring and optimization");
    log.info("  • Caching Utilities - LRU cache with memoization");
    log.info('  • Lighthouse Audit - Run "pnpm perf:audit" for performance audit');
  } catch (error) {
    log.error(`Performance optimization setup failed: ${error}`);
    throw error;
  }
}

// Execute when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizePerformance().catch(console.error);
}

export default optimizePerformance;
