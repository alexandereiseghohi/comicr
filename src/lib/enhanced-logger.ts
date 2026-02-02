import winston from "winston";

// Enhanced logger that extends the existing audit logging system
export interface LogContext {
  action?: string;
  component?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
  method?: string;
  requestId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
}

export interface LogEntry extends LogContext {
  category: "api" | "auth" | "database" | "performance" | "security" | "system" | "user";
  error?: Error;
  level: "debug" | "error" | "info" | "warn";
  message: string;
  timestamp: string;
}

class Logger {
  private winston: winston.Logger;
  private defaultContext: Partial<LogContext> = {};

  constructor() {
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta,
          });
        })
      ),
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
        // File transport for production
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          tailable: true,
        }),
        new winston.transports.File({
          filename: "logs/combined.log",
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 10,
          tailable: true,
        }),
      ],
    });
  }

  setDefaultContext(context: Partial<LogContext>) {
    this.defaultContext = { ...this.defaultContext, ...context };
  }

  private log(
    level: LogEntry["level"],
    category: LogEntry["category"],
    message: string,
    context: Partial<LogContext> = {},
    error?: Error
  ) {
    const logEntry: LogEntry = {
      level,
      category,
      message,
      timestamp: new Date().toISOString(),
      ...this.defaultContext,
      ...context,
      ...(error && {
        error: { name: error.name, message: error.message, stack: error.stack },
      }),
    };

    this.winston.log(level, message, logEntry);

    // Also use existing audit logger for critical events
    if (level === "error" || category === "security") {
      // Import and use existing audit logger
      this.logAudit(logEntry);
    }
  }

  private async logAudit(entry: LogEntry) {
    try {
      // This would integrate with existing audit-logger.ts
      // For now, just log to console until audit-logger is properly imported
      console.log("Audit log entry:", {
        action: entry.action || entry.category,
        userId: entry.userId,
        details: {
          level: entry.level,
          message: entry.message,
          category: entry.category,
          metadata: entry.metadata,
        },
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }

  // Authentication logging
  auth(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("info", "auth", message, context, error);
  }

  authError(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("error", "auth", message, context, error);
  }

  // Database logging
  database(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("info", "database", message, context, error);
  }

  databaseError(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("error", "database", message, context, error);
  }

  // API logging
  api(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("info", "api", message, context, error);
  }

  apiError(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("error", "api", message, context, error);
  }

  // Security logging - always logged to audit
  security(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("warn", "security", message, context, error);
  }

  securityError(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("error", "security", message, context, error);
  }

  // Performance logging
  performance(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("info", "performance", message, context, error);
  }

  performanceWarn(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("warn", "performance", message, context, error);
  }

  // User activity logging
  user(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("info", "user", message, context, error);
  }

  // System logging
  system(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("info", "system", message, context, error);
  }

  systemError(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("error", "system", message, context, error);
  }

  // General logging methods
  info(message: string, context: Partial<LogContext> = {}) {
    this.log("info", "system", message, context);
  }

  warn(message: string, context: Partial<LogContext> = {}) {
    this.log("warn", "system", message, context);
  }

  error(message: string, context: Partial<LogContext> = {}, error?: Error) {
    this.log("error", "system", message, context, error);
  }

  debug(message: string, context: Partial<LogContext> = {}) {
    this.log("debug", "system", message, context);
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience function for middleware
export function createRequestLogger(req: unknown) {
  return {
    ...logger,
    setRequestContext: (context: Partial<LogContext>) => {
      logger.setDefaultContext({
        requestId: typeof req === "object" && req && "id" in req ? (req as any).id : Math.random().toString(36),
        ip:
          typeof req === "object" && req && "ip" in req
            ? (req as any).ip
            : typeof req === "object" && req && "connection" in req && (req as any).connection?.remoteAddress,
        userAgent:
          typeof req === "object" && req && "headers" in req && (req as any).headers
            ? (req as any).headers["user-agent"]
            : undefined,
        url: typeof req === "object" && req && "url" in req ? (req as any).url : undefined,
        method: typeof req === "object" && req && "method" in req ? (req as any).method : undefined,
        ...context,
      });
    },
  };
}

export default logger;
