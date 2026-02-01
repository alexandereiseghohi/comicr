/**
 * Role Permission Seeder
 * @description Standard 3-tier RBAC seeder (Admin, Moderator, User)
 */

import { db } from "@/database/db";
import { permission, role, rolePermission } from "@/database/schema";
import { eq } from "drizzle-orm";

/**
 * Default roles with descriptions
 */
const DEFAULT_ROLES = [
  {
    name: "admin",
    description: "Full system access with all permissions",
    isSystem: true,
  },
  {
    name: "moderator",
    description: "Content management and user moderation capabilities",
    isSystem: true,
  },
  {
    name: "user",
    description: "Standard user with basic read and personal data access",
    isSystem: true,
  },
] as const;

/**
 * Permission definitions by resource
 */
const PERMISSIONS = {
  // User management
  user: ["create", "read", "update", "delete", "manage"],
  // Comic management
  comic: ["create", "read", "update", "delete", "manage"],
  // Chapter management
  chapter: ["create", "read", "update", "delete", "manage"],
  // Comment management
  comment: ["create", "read", "update", "delete", "moderate"],
  // Bookmark management
  bookmark: ["create", "read", "update", "delete"],
  // Rating management
  rating: ["create", "read", "update", "delete"],
  // Reading progress
  readingProgress: ["create", "read", "update", "delete"],
  // Notification management
  notification: ["create", "read", "update", "delete", "manage"],
  // Role management
  role: ["create", "read", "update", "delete", "assign"],
  // Permission management
  permission: ["create", "read", "update", "delete", "assign"],
  // Audit log access
  auditLog: ["read", "export", "delete"],
  // System settings
  system: ["read", "update", "manage"],
} as const;

/**
 * Role-permission mapping
 */
const ROLE_PERMISSIONS: Record<string, Array<{ resource: string; action: string }>> = {
  admin: [
    // Admin has all permissions
    ...Object.entries(PERMISSIONS).flatMap(([resource, actions]) =>
      actions.map((action) => ({ resource, action }))
    ),
  ],
  moderator: [
    // User management (limited)
    { resource: "user", action: "read" },
    // Full comic/chapter management
    { resource: "comic", action: "create" },
    { resource: "comic", action: "read" },
    { resource: "comic", action: "update" },
    { resource: "comic", action: "delete" },
    { resource: "chapter", action: "create" },
    { resource: "chapter", action: "read" },
    { resource: "chapter", action: "update" },
    { resource: "chapter", action: "delete" },
    // Comment moderation
    { resource: "comment", action: "read" },
    { resource: "comment", action: "delete" },
    { resource: "comment", action: "moderate" },
    // View audit logs
    { resource: "auditLog", action: "read" },
    // Notifications
    { resource: "notification", action: "create" },
    { resource: "notification", action: "read" },
    { resource: "notification", action: "manage" },
    // Personal data
    { resource: "bookmark", action: "create" },
    { resource: "bookmark", action: "read" },
    { resource: "bookmark", action: "update" },
    { resource: "bookmark", action: "delete" },
    { resource: "rating", action: "create" },
    { resource: "rating", action: "read" },
    { resource: "rating", action: "update" },
    { resource: "rating", action: "delete" },
    { resource: "readingProgress", action: "create" },
    { resource: "readingProgress", action: "read" },
    { resource: "readingProgress", action: "update" },
    { resource: "readingProgress", action: "delete" },
  ],
  user: [
    // Read-only comics/chapters
    { resource: "comic", action: "read" },
    { resource: "chapter", action: "read" },
    // Own comments
    { resource: "comment", action: "create" },
    { resource: "comment", action: "read" },
    { resource: "comment", action: "update" },
    { resource: "comment", action: "delete" },
    // Own bookmarks
    { resource: "bookmark", action: "create" },
    { resource: "bookmark", action: "read" },
    { resource: "bookmark", action: "update" },
    { resource: "bookmark", action: "delete" },
    // Own ratings
    { resource: "rating", action: "create" },
    { resource: "rating", action: "read" },
    { resource: "rating", action: "update" },
    { resource: "rating", action: "delete" },
    // Own reading progress
    { resource: "readingProgress", action: "create" },
    { resource: "readingProgress", action: "read" },
    { resource: "readingProgress", action: "update" },
    { resource: "readingProgress", action: "delete" },
    // Own notifications
    { resource: "notification", action: "read" },
    { resource: "notification", action: "update" },
    { resource: "notification", action: "delete" },
  ],
};

export interface SeedResult {
  success: boolean;
  rolesCreated: number;
  permissionsCreated: number;
  mappingsCreated: number;
  error?: string;
}

/**
 * Seed roles, permissions, and role-permission mappings
 */
export async function seedRolesAndPermissions(): Promise<SeedResult> {
  try {
    let rolesCreated = 0;
    let permissionsCreated = 0;
    let mappingsCreated = 0;

    // Create roles
    for (const roleData of DEFAULT_ROLES) {
      const existing = await db.query.role.findFirst({
        where: eq(role.name, roleData.name),
      });

      if (!existing) {
        await db.insert(role).values({
          name: roleData.name,
          description: roleData.description,
          isSystem: roleData.isSystem,
        });
        rolesCreated++;
      }
    }

    // Create permissions
    for (const [resource, actions] of Object.entries(PERMISSIONS)) {
      for (const action of actions) {
        const permName = `${resource}:${action}`;
        const existing = await db.query.permission.findFirst({
          where: eq(permission.name, permName),
        });

        if (!existing) {
          await db.insert(permission).values({
            name: permName,
            resource: resource as typeof permission.$inferInsert.resource,
            action: action as typeof permission.$inferInsert.action,
          });
          permissionsCreated++;
        }
      }
    }

    // Create role-permission mappings
    for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
      const roleRecord = await db.query.role.findFirst({
        where: eq(role.name, roleName),
      });

      if (!roleRecord) continue;

      for (const perm of perms) {
        const permName = `${perm.resource}:${perm.action}`;
        const permRecord = await db.query.permission.findFirst({
          where: eq(permission.name, permName),
        });

        if (!permRecord) continue;

        // Check if mapping exists
        const existingMapping = await db.query.rolePermission.findFirst({
          where: (rp, { and, eq }) =>
            and(eq(rp.roleId, roleRecord.id), eq(rp.permissionId, permRecord.id)),
        });

        if (!existingMapping) {
          await db.insert(rolePermission).values({
            roleId: roleRecord.id,
            permissionId: permRecord.id,
          });
          mappingsCreated++;
        }
      }
    }

    console.log(
      `[RolePermissionSeeder] Created: ${rolesCreated} roles, ${permissionsCreated} permissions, ${mappingsCreated} mappings`
    );

    return {
      success: true,
      rolesCreated,
      permissionsCreated,
      mappingsCreated,
    };
  } catch (error) {
    console.error("[RolePermissionSeeder] Error:", error);
    return {
      success: false,
      rolesCreated: 0,
      permissionsCreated: 0,
      mappingsCreated: 0,
      error: error instanceof Error ? error.message : "Seeding failed",
    };
  }
}

/**
 * Get all permissions for a role
 */
export async function getRolePermissions(roleName: string): Promise<string[]> {
  const roleRecord = await db.query.role.findFirst({
    where: eq(role.name, roleName),
  });

  if (!roleRecord) return [];

  // Fetch permissions separately since relations may not be set up
  const mappings = await db.query.rolePermission.findMany({
    where: eq(rolePermission.roleId, roleRecord.id),
  });

  const permIds = mappings.map((m) => m.permissionId);
  if (permIds.length === 0) return [];

  const perms = await db.query.permission.findMany();
  return perms.filter((p) => permIds.includes(p.id)).map((p) => p.name);
}

/**
 * Check if a role has a specific permission
 */
export async function roleHasPermission(
  roleName: string,
  resource: string,
  action: string
): Promise<boolean> {
  const perms = await getRolePermissions(roleName);
  return perms.includes(`${resource}:${action}`);
}
