import { and, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";

import { db } from "@/database/db";
import { auditLog, user } from "@/database/schema";
import { type AuditAction, type AuditResource } from "@/lib/audit/audit-logger";

export interface AuditLogQueryOptions {
  /** Filter by action type */
  action?: AuditAction;
  /** End date filter */
  endDate?: Date;
  /** Pagination: items per page */
  limit?: number;
  /** Pagination: page number (1-based) */
  page?: number;
  /** Filter by resource type */
  resource?: AuditResource;
  /** Filter by resource ID */
  resourceId?: string;
  /** Search in details */
  search?: string;
  /** Start date filter */
  startDate?: Date;
  /** Filter by user ID */
  userId?: string;
}

export interface AuditLogEntry {
  action: string;
  createdAt: Date;
  details: null | Record<string, unknown>;
  id: string;
  ipAddress: null | string;
  newValues: null | Record<string, unknown>;
  oldValues: null | Record<string, unknown>;
  resource: string;
  resourceId: null | string;
  sessionId: null | string;
  userAgent: null | string;
  userEmail: null | string;
  userId: null | string;
  userName: null | string;
}

export interface PaginatedAuditLogs {
  data: AuditLogEntry[];
  meta: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get paginated audit logs with filters
 */
export async function getAuditLogs(options: AuditLogQueryOptions = {}): Promise<PaginatedAuditLogs> {
  const page = options.page || 1;
  const limit = options.limit || 50;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];

  if (options.userId) {
    conditions.push(eq(auditLog.userId, options.userId));
  }

  if (options.action) {
    conditions.push(eq(auditLog.action, options.action));
  }

  if (options.resource) {
    conditions.push(eq(auditLog.resource, options.resource));
  }

  if (options.resourceId) {
    conditions.push(eq(auditLog.resourceId, options.resourceId));
  }

  if (options.startDate) {
    conditions.push(gte(auditLog.createdAt, options.startDate));
  }

  if (options.endDate) {
    conditions.push(lte(auditLog.createdAt, options.endDate));
  }

  if (options.search) {
    const searchPattern = `%${options.search}%`;
    conditions.push(
      or(
        like(auditLog.details, searchPattern),
        like(auditLog.resourceId, searchPattern),
        like(auditLog.action, searchPattern)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLog)
    .where(whereClause);

  const total = Number(countResult[0]?.count || 0);

  // Get paginated data with user info
  const logs = await db
    .select({
      id: auditLog.id,
      userId: auditLog.userId,
      userName: user.name,
      userEmail: user.email,
      action: auditLog.action,
      resource: auditLog.resource,
      resourceId: auditLog.resourceId,
      details: auditLog.details,
      oldValues: auditLog.oldValues,
      newValues: auditLog.newValues,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      sessionId: auditLog.sessionId,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .leftJoin(user, eq(auditLog.userId, user.id))
    .where(whereClause)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
    .offset(offset);

  // Parse JSON fields
  const data: AuditLogEntry[] = logs.map((log) => ({
    ...log,
    details: log.details ? JSON.parse(log.details) : null,
    oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
    newValues: log.newValues ? JSON.parse(log.newValues) : null,
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  options: Omit<AuditLogQueryOptions, "userId"> = {}
): Promise<PaginatedAuditLogs> {
  return getAuditLogs({ ...options, userId });
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resource: AuditResource,
  resourceId: string,
  options: Omit<AuditLogQueryOptions, "resource" | "resourceId"> = {}
): Promise<PaginatedAuditLogs> {
  return getAuditLogs({ ...options, resource, resourceId });
}

/**
 * Get recent audit activity summary
 */
export async function getAuditSummary(days: number = 7): Promise<{
  actionBreakdown: Record<string, number>;
  resourceBreakdown: Record<string, number>;
  topUsers: Array<{ count: number; name: null | string; userId: string }>;
  totalActions: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Total actions
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLog)
    .where(gte(auditLog.createdAt, startDate));

  // Action breakdown
  const actionBreakdownResult = await db
    .select({
      action: auditLog.action,
      count: sql<number>`count(*)`,
    })
    .from(auditLog)
    .where(gte(auditLog.createdAt, startDate))
    .groupBy(auditLog.action);

  // Resource breakdown
  const resourceBreakdownResult = await db
    .select({
      resource: auditLog.resource,
      count: sql<number>`count(*)`,
    })
    .from(auditLog)
    .where(gte(auditLog.createdAt, startDate))
    .groupBy(auditLog.resource);

  // Top users
  const topUsersResult = await db
    .select({
      userId: auditLog.userId,
      name: user.name,
      count: sql<number>`count(*)`,
    })
    .from(auditLog)
    .leftJoin(user, eq(auditLog.userId, user.id))
    .where(gte(auditLog.createdAt, startDate))
    .groupBy(auditLog.userId, user.name)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  return {
    totalActions: Number(totalResult[0]?.count || 0),
    actionBreakdown: Object.fromEntries(actionBreakdownResult.map((r) => [r.action, Number(r.count)])),
    resourceBreakdown: Object.fromEntries(resourceBreakdownResult.map((r) => [r.resource, Number(r.count)])),
    topUsers: topUsersResult
      .filter((u) => u.userId)
      .map((u) => ({
        userId: u.userId!,
        name: u.name,
        count: Number(u.count),
      })),
  };
}
