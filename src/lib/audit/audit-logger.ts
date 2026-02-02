/**
 * Audit Logger
 * @description Comprehensive audit logging with DB + file storage
 */

import { db } from "@/database/db";
import { auditLog, type resourceEnum } from "@/database/schema";

import { writeAuditToFile } from "./audit-file-writer";

export type AuditAction =
  | "api_access"
  | "create"
  | "delete"
  | "download"
  | "email_verified"
  | "export"
  | "import"
  | "login"
  | "logout"
  | "password_change"
  | "password_reset"
  | "permission_change"
  | "read"
  | "role_change"
  | "settings_change"
  | "update"
  | "upload"
  | "view";

export type AuditResource = (typeof resourceEnum.enumValues)[number];

export interface AuditLogEntry {
  /** Type of action performed */
  action: AuditAction;
  /** Additional details (JSON serializable) */
  details?: Record<string, unknown>;
  /** Client IP address */
  ipAddress?: string;
  /** New values (for creates/updates) */
  newValues?: Record<string, unknown>;
  /** Previous values (for updates) */
  oldValues?: Record<string, unknown>;
  /** Resource type being acted upon */
  resource: AuditResource;
  /** ID of the specific resource */
  resourceId?: string;
  /** Associated session ID */
  sessionId?: string;
  /** Client user agent */
  userAgent?: string;
  /** User performing the action (null for system actions) */
  userId?: null | string;
}

export interface AuditLogResult {
  error?: string;
  id?: string;
  success: boolean;
}

/**
 * Log an audit event to both database and file
 */
export async function logAudit(entry: AuditLogEntry): Promise<AuditLogResult> {
  try {
    const id = crypto.randomUUID();
    const now = new Date();

    // Prepare the log entry
    const logEntry = {
      id,
      userId: entry.userId || null,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId || null,
      details: entry.details ? JSON.stringify(entry.details) : null,
      oldValues: entry.oldValues ? JSON.stringify(entry.oldValues) : null,
      newValues: entry.newValues ? JSON.stringify(entry.newValues) : null,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
      sessionId: entry.sessionId || null,
      createdAt: now,
    };

    // Write to database
    await db.insert(auditLog).values(logEntry);

    // Write to file backup (async, don't block)
    writeAuditToFile({
      ...logEntry,
      timestamp: now.toISOString(),
    }).catch((err) => {
      console.error("[AuditLogger] File write error:", err);
    });

    return { success: true, id };
  } catch (error) {
    console.error("[AuditLogger] Database write error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Audit log failed",
    };
  }
}

/**
 * Helper to create audit log from request context
 */
export function createAuditContext(
  request: Request
): Pick<AuditLogEntry, "ipAddress" | "userAgent"> {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
  };
}

/**
 * Audit logging middleware for API routes
 */
export function withAuditLog<T extends Record<string, unknown>>(
  action: AuditAction,
  resource: AuditResource,
  options?: {
    getDetails?: (body: T, result: unknown) => Record<string, unknown>;
    getResourceId?: (body: T) => string | undefined;
  }
) {
  return async (
    handler: (body: T, context: { request: Request; userId?: string; }) => Promise<unknown>,
    body: T,
    context: { request: Request; userId?: string; }
  ): Promise<unknown> => {
    const startTime = Date.now();
    let result: unknown;
    let error: Error | null = null;

    try {
      result = await handler(body, context);
      return result;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      const auditContext = createAuditContext(context.request);

      await logAudit({
        userId: context.userId,
        action,
        resource,
        resourceId: options?.getResourceId?.(body),
        details: {
          ...options?.getDetails?.(body, result),
          duration: Date.now() - startTime,
          ...(error && { error: error.message }),
        },
        ...auditContext,
      });
    }
  };
}

/**
 * Pre-built audit loggers for common actions
 */
export const auditLoggers = {
  login: (userId: string, request: Request, success: boolean = true) =>
    logAudit({
      userId,
      action: "login",
      resource: "user",
      resourceId: userId,
      details: { success },
      ...createAuditContext(request),
    }),

  logout: (userId: string, request: Request) =>
    logAudit({
      userId,
      action: "logout",
      resource: "user",
      resourceId: userId,
      ...createAuditContext(request),
    }),

  create: <T extends Record<string, unknown>>(
    userId: string | undefined,
    resource: AuditResource,
    resourceId: string,
    newValues: T,
    request?: Request
  ) =>
    logAudit({
      userId,
      action: "create",
      resource,
      resourceId,
      newValues,
      ...(request && createAuditContext(request)),
    }),

  update: <T extends Record<string, unknown>>(
    userId: string | undefined,
    resource: AuditResource,
    resourceId: string,
    oldValues: T,
    newValues: T,
    request?: Request
  ) =>
    logAudit({
      userId,
      action: "update",
      resource,
      resourceId,
      oldValues,
      newValues,
      ...(request && createAuditContext(request)),
    }),

  delete: (
    userId: string | undefined,
    resource: AuditResource,
    resourceId: string,
    request?: Request
  ) =>
    logAudit({
      userId,
      action: "delete",
      resource,
      resourceId,
      ...(request && createAuditContext(request)),
    }),

  permissionChange: (
    adminUserId: string,
    targetUserId: string,
    oldRoles: string[],
    newRoles: string[],
    request?: Request
  ) =>
    logAudit({
      userId: adminUserId,
      action: "permission_change",
      resource: "user",
      resourceId: targetUserId,
      oldValues: { roles: oldRoles },
      newValues: { roles: newRoles },
      ...(request && createAuditContext(request)),
    }),
};
