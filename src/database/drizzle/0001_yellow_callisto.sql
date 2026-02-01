CREATE TYPE "public"."action_type" AS ENUM('create', 'read', 'update', 'delete', 'manage');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('comic', 'chapter', 'user', 'comment', 'rating', 'bookmark', 'notification', 'author', 'artist', 'genre', 'type', 'system');--> statement-breakpoint
CREATE TABLE "auditLog" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"action" text NOT NULL,
	"resource" "resource_type" NOT NULL,
	"resourceId" text,
	"details" text,
	"oldValues" text,
	"newValues" text,
	"ipAddress" text,
	"userAgent" text,
	"sessionId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permission" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"resource" "resource_type" NOT NULL,
	"action" "action_type" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permission_name_unique" UNIQUE("name"),
	CONSTRAINT "permissionResourceActionUnique" UNIQUE("resource","action")
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"isSystem" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "rolePermission" (
	"roleId" integer NOT NULL,
	"permissionId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rolePermission_roleId_permissionId_pk" PRIMARY KEY("roleId","permissionId")
);
--> statement-breakpoint
CREATE TABLE "userRole" (
	"userId" text NOT NULL,
	"roleId" integer NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL,
	"assignedBy" text,
	CONSTRAINT "userRole_userId_roleId_pk" PRIMARY KEY("userId","roleId")
);
--> statement-breakpoint
ALTER TABLE "auditLog" ADD CONSTRAINT "auditLog_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rolePermission" ADD CONSTRAINT "rolePermission_roleId_role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rolePermission" ADD CONSTRAINT "rolePermission_permissionId_permission_id_fk" FOREIGN KEY ("permissionId") REFERENCES "public"."permission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userRole" ADD CONSTRAINT "userRole_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userRole" ADD CONSTRAINT "userRole_roleId_role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userRole" ADD CONSTRAINT "userRole_assignedBy_user_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auditLogUserIdIdx" ON "auditLog" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "auditLogActionIdx" ON "auditLog" USING btree ("action");--> statement-breakpoint
CREATE INDEX "auditLogResourceIdx" ON "auditLog" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "auditLogResourceIdIdx" ON "auditLog" USING btree ("resourceId");--> statement-breakpoint
CREATE INDEX "auditLogCreatedAtIdx" ON "auditLog" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "auditLogUserActionIdx" ON "auditLog" USING btree ("userId","action");--> statement-breakpoint
CREATE INDEX "auditLogResourceActionIdx" ON "auditLog" USING btree ("resource","action");--> statement-breakpoint
CREATE INDEX "permissionNameIdx" ON "permission" USING btree ("name");--> statement-breakpoint
CREATE INDEX "permissionResourceIdx" ON "permission" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "permissionActionIdx" ON "permission" USING btree ("action");--> statement-breakpoint
CREATE INDEX "roleNameIdx" ON "role" USING btree ("name");--> statement-breakpoint
CREATE INDEX "roleIsSystemIdx" ON "role" USING btree ("isSystem");--> statement-breakpoint
CREATE INDEX "rolePermissionRoleIdIdx" ON "rolePermission" USING btree ("roleId");--> statement-breakpoint
CREATE INDEX "rolePermissionPermissionIdIdx" ON "rolePermission" USING btree ("permissionId");--> statement-breakpoint
CREATE INDEX "userRoleUserIdIdx" ON "userRole" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "userRoleRoleIdIdx" ON "userRole" USING btree ("roleId");