#!/usr/bin/env tsx
/**
 * setup-logging.ts - Enhanced Logging Infrastructure
 * Extends existing audit logging with comprehensive application logging
 * Integrates structured logging with Winston/Pino and monitoring
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

// Required logging packages
const LOGGING_PACKAGES = [
  "winston",
  "winston-daily-rotate-file",
  "@types/winston",
  "pino",
  "pino-pretty",
  "next-logger",
];

// Winston logger configuration
const WINSTON_LOGGER = `import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Log levels following RFC 5424
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'grey',
};

winston.addColors(logColors);

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, userId, requestId, error, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: service || 'comicr',
      userId: userId || null,
      requestId: requestId || null,
      error: error || null,
      meta: Object.keys(meta).length ? meta : undefined,
    });
  })
);

// Development format for console
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, requestId, ...meta }: any) => {
    const metaStr = Object.keys(meta).length ? \` \${JSON.stringify(meta)}\` : '';
    const reqId = requestId ? \` [\${requestId.slice(0, 8)}]\` : '';
    return \`\${timestamp} \${level}\${reqId}: \${message}\${metaStr}\`;
  })
);

// Log directory
const logsDir = path.join(process.cwd(), 'logs');

// Daily rotate file transport for all logs
const dailyRotateFile = new DailyRotateFile({
  filename: path.join(logsDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
});

// Separate error logs
const errorRotateFile = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: logFormat,
});

// HTTP request logs
const httpRotateFile = new DailyRotateFile({
  filename: path.join(logsDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '7d',
  level: 'http',
  format: logFormat,
});

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: {
    service: 'comicr',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  },
  transports: [
    dailyRotateFile,
    errorRotateFile,
    httpRotateFile,
  ],
  exitOnError: false,
});

// Add console transport for non-production
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: devFormat,
    level: process.env.LOG_LEVEL || 'debug',
  }));
}

// Unhandled exceptions and rejections
logger.exceptions.handle(
  new DailyRotateFile({
    filename: path.join(logsDir, 'exceptions-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat,
  })
);

logger.rejections.handle(
  new DailyRotateFile({
    filename: path.join(logsDir, 'rejections-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat,
  })
);

export default logger;

// Enhanced logging methods with context
export const Logger = {
  error: (message: string, error?: Error, meta?: Record<string, unknown>) => {
    logger.error(message, { error: error?.stack, ...meta });
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    logger.warn(message, meta);
  },

  info: (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, meta);
  },

  http: (message: string, meta?: Record<string, unknown>) => {
    logger.http(message, meta);
  },

  debug: (message: string, meta?: Record<string, unknown>) => {
    logger.debug(message, meta);
  },

  // Structured logging for different contexts
  auth: (action: string, userId?: string, meta?: Record<string, unknown>) => {
    logger.info(\`Auth: \${action}\`, { context: 'auth', userId, ...meta });
  },

  database: (query: string, duration?: number, meta?: Record<string, unknown>) => {
    logger.debug(\`Database: \${query}\`, { context: 'database', duration, ...meta });
  },

  api: (method: string, path: string, statusCode: number, duration: number, userId?: string) => {
    logger.http(\`\${method} \${path} \${statusCode}\`, {
      context: 'api',
      method,
      path,
      statusCode,
      duration,
      userId,
    });
  },

  security: (event: string, severity: 'low' | 'medium' | 'high', meta?: Record<string, unknown>) => {
    logger.warn(\`Security: \${event}\`, { context: 'security', severity, ...meta });
  },

  performance: (metric: string, value: number, unit: string, meta?: Record<string, unknown>) => {
    logger.info(\`Performance: \${metric} = \${value}\${unit}\`, {
      context: 'performance',
      metric,
      value,
      unit,
      ...meta
    });
  },
};`;

// Next.js integration middleware
const NEXTJS_LOGGER_MIDDLEWARE = `import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/logging/winston-logger';
import crypto from 'crypto';

export function LoggingMiddleware() {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID().split('-')[0];

    // Add request ID to headers for tracing
    const response = NextResponse.next({
      request: {
        headers: new Headers({
          ...Object.fromEntries(request.headers.entries()),
          'x-request-id': requestId,
        }),
      },
    });

    // Log the request
    const { method, url, headers, ip } = request;
    const userAgent = headers.get('user-agent') || 'unknown';

    // Extract user ID if available (from auth)
    const userId = headers.get('x-user-id') || undefined;

    // Calculate response time and log
    const duration = Date.now() - startTime;

    response.headers.set('x-request-id', requestId);
    response.headers.set('x-response-time', \`\${duration}ms\`);

    // Log API request
    Logger.api(method, url, response.status, duration, userId);

    // Log additional details for debugging
    if (process.env.NODE_ENV === 'development') {
      Logger.debug('Request details', {
        requestId,
        method,
        url,
        userAgent,
        ip,
        headers: Object.fromEntries(headers.entries()),
      });
    }

    // Log slow requests
    if (duration > 1000) {
      Logger.warn('Slow request detected', {
        requestId,
        method,
        url,
        duration,
        userId,
      });
    }

    return response;
  };
}`;

// Pino logger for high-performance scenarios
const PINO_LOGGER = `import pino from 'pino';
import path from 'path';

const pinoConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Structured logging format
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      service: 'comicr',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      ...bindings,
    }),
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,

  // Development pretty printing
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:HH:MM:ss',
      },
    },
  }),

  // Production file destinations
  ...(process.env.NODE_ENV === 'production' && {
    transport: {
      targets: [
        {
          target: 'pino/file',
          options: {
            destination: path.join(process.cwd(), 'logs', 'app-pino.log'),
            mkdir: true,
          },
          level: 'info',
        },
        {
          target: 'pino/file',
          options: {
            destination: path.join(process.cwd(), 'logs', 'error-pino.log'),
            mkdir: true,
          },
          level: 'error',
        },
      ],
    },
  }),
};

const pinoLogger = pino(pinoConfig);

// Export structured logging functions
export const PinoLogger = {
  error: (msg: string, obj?: object) => pinoLogger.error(obj, msg),
  warn: (msg: string, obj?: object) => pinoLogger.warn(obj, msg),
  info: (msg: string, obj?: object) => pinoLogger.info(obj, msg),
  debug: (msg: string, obj?: object) => pinoLogger.debug(obj, msg),
  trace: (msg: string, obj?: object) => pinoLogger.trace(obj, msg),

  // Context-specific loggers
  child: (context: Record<string, unknown>) => pinoLogger.child(context),

  // High-performance logging for hot paths
  fastLog: (level: pino.Level, msg: string, obj?: object) => {
    if (pinoLogger.isLevelEnabled(level)) {
      pinoLogger[level](obj, msg);
    }
  },
};

export default pinoLogger;`;

// Log analysis utilities
const LOG_ANALYSIS = `import fs from 'fs/promises';
import path from 'path';
import { Logger } from './winston-logger';

interface LogStats {
  totalEntries: number;
  errorCount: number;
  warningCount: number;
  averageResponseTime: number;
  slowRequests: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  topErrors: Array<{ error: string; count: number }>;
}

export class LogAnalyzer {
  private logsDir = path.join(process.cwd(), 'logs');

  async analyzeDaily(date?: string): Promise<LogStats> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logsDir, \`app-\${targetDate}.log\`);

    try {
      const content = await fs.readFile(logFile, 'utf-8');
      const lines = content.split('\\n').filter(Boolean);

      const stats: LogStats = {
        totalEntries: lines.length,
        errorCount: 0,
        warningCount: 0,
        averageResponseTime: 0,
        slowRequests: 0,
        topEndpoints: [],
        topErrors: [],
      };

      const endpointCounts = new Map<string, number>();
      const errorCounts = new Map<string, number>();
      const responseTimes: number[] = [];

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);

          // Count errors and warnings
          if (entry.level === 'error') stats.errorCount++;
          if (entry.level === 'warn') stats.warningCount++;

          // Analyze API requests
          if (entry.meta?.context === 'api') {
            const endpoint = \`\${entry.meta.method} \${entry.meta.path}\`;
            endpointCounts.set(endpoint, (endpointCounts.get(endpoint) || 0) + 1);

            const duration = entry.meta.duration;
            if (duration) {
              responseTimes.push(duration);
              if (duration > 1000) stats.slowRequests++;
            }
          }

          // Collect error messages
          if (entry.level === 'error' && entry.message) {
            const errorMsg = entry.message.split(':')[0]; // Get error type
            errorCounts.set(errorMsg, (errorCounts.get(errorMsg) || 0) + 1);
          }
        } catch (e) {
          // Skip malformed lines
        }
      }

      // Calculate averages
      if (responseTimes.length > 0) {
        stats.averageResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
      }

      // Top endpoints
      stats.topEndpoints = Array.from(endpointCounts.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([endpoint, count]) => ({ endpoint, count }));

      // Top errors
      stats.topErrors = Array.from(errorCounts.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([error, count]) => ({ error, count }));

      return stats;
    } catch (error) {
      Logger.error('Failed to analyze logs', error as Error, { date: targetDate });
      throw error;
    }
  }

  async generateReport(days: number = 7): Promise<string> {
    const reports: Array<{ date: string; stats: LogStats }> = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      try {
        const stats = await this.analyzeDaily(dateStr);
        reports.push({ date: dateStr, stats });
      } catch {
        // Skip missing files
      }
    }

    let report = '# Log Analysis Report\\n\\n';
    report += 'Generated: ' + new Date().toISOString() + '\\n\\n';

    for (const { date, stats } of reports) {
      report += \`## \${date}\\n\\n\`;
      report += \`- **Total Entries**: \${stats.totalEntries}\\n\`;
      report += \`- **Errors**: \${stats.errorCount}\\n\`;
      report += \`- **Warnings**: \${stats.warningCount}\\n\`;
      report += \`- **Average Response Time**: \${Math.round(stats.averageResponseTime)}ms\\n\`;
      report += \`- **Slow Requests (>1s)**: \${stats.slowRequests}\\n\\n\`;

      if (stats.topEndpoints.length > 0) {
        report += '### Top Endpoints\\n';
        for (const { endpoint, count } of stats.topEndpoints) {
          report += \`- \${endpoint}: \${count} requests\\n\`;
        }
        report += '\\n';
      }

      if (stats.topErrors.length > 0) {
        report += '### Top Errors\\n';
        for (const { error, count } of stats.topErrors) {
          report += '- ' + error + ': ' + count + ' occurrences\\n';
        }
        report += '\\n';
      }
    }

    return report;
  }
}`;

async function setupLogging() {
  log.info("📊 Setting up enhanced logging infrastructure...");

  try {
    // Install logging packages
    log.info("Installing logging packages...");
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

    const packagesToInstall = LOGGING_PACKAGES.filter((pkg) => {
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
      log.success("Logging packages installed");
    } else {
      log.success("All logging packages already installed");
    }

    // Create logging directory structure
    const loggingDir = path.join(process.cwd(), "src", "lib", "logging");
    const logsDir = path.join(process.cwd(), "logs");

    await fs.mkdir(loggingDir, { recursive: true });
    await fs.mkdir(logsDir, { recursive: true });

    // Create Winston logger
    log.info("Creating Winston logger configuration...");
    const winstonPath = path.join(loggingDir, "winston-logger.ts");
    await fs.writeFile(winstonPath, WINSTON_LOGGER);
    log.success("✓ Created Winston logger");

    // Create Pino logger
    log.info("Creating Pino logger configuration...");
    const pinoPath = path.join(loggingDir, "pino-logger.ts");
    await fs.writeFile(pinoPath, PINO_LOGGER);
    log.success("✓ Created Pino logger");

    // Create logging middleware
    log.info("Creating Next.js logging middleware...");
    const middlewarePath = path.join(loggingDir, "middleware.ts");
    await fs.writeFile(middlewarePath, NEXTJS_LOGGER_MIDDLEWARE);
    log.success("✓ Created logging middleware");

    // Create log analysis utilities
    log.info("Creating log analysis utilities...");
    const analysisPath = path.join(loggingDir, "log-analyzer.ts");
    await fs.writeFile(analysisPath, LOG_ANALYSIS);
    log.success("✓ Created log analyzer");

    // Create logging index
    const indexContent = `export * from './winston-logger';
export * from './pino-logger';
export * from './middleware';
export * from './log-analyzer';

// Default logger (Winston)
export { Logger as default } from './winston-logger';
`;
    const indexPath = path.join(loggingDir, "index.ts");
    await fs.writeFile(indexPath, indexContent);
    log.success("✓ Created logging index");

    // Create .gitignore for logs directory
    const gitignorePath = path.join(logsDir, ".gitignore");
    const gitignoreContent = `# Log files
*.log
*.log.*

# Keep directory structure
!.gitignore
`;
    await fs.writeFile(gitignorePath, gitignoreContent);
    log.success("✓ Created logs .gitignore");

    log.success("🎉 Enhanced logging setup completed successfully!");
    log.info("Available loggers:");
    log.info("  • Winston Logger - Full-featured with daily rotation");
    log.info("  • Pino Logger - High-performance structured logging");
    log.info("  • Log Analyzer - Analysis and reporting utilities");
    log.info("  • Logging Middleware - Next.js request/response logging");
  } catch (error) {
    log.error(`Logging setup failed: ${error}`);
    throw error;
  }
}

// Execute when run directly
if (import.meta.url === `file://${process.argv[1]!}`) {
  setupLogging().catch(console.error);
}

export default setupLogging;
