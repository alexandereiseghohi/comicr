/**
 * Health Check Endpoint
 * Used by deployment platforms and monitoring services to verify app status
 *
 * GET /api/health - Returns health status
 */

import { NextResponse } from "next/server";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database?: "ok" | "error";
    cache?: "ok" | "error";
  };
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const startTime = process.uptime();

  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    uptime: Math.floor(startTime),
    checks: {},
  };

  // Optional: Add database health check
  // Commented out to keep health check fast - uncomment if needed
  /*
  try {
    const { db } = await import("@/database/db");
    await db.execute(sql`SELECT 1`);
    healthStatus.checks.database = "ok";
  } catch {
    healthStatus.checks.database = "error";
    healthStatus.status = "degraded";
  }
  */

  return NextResponse.json(healthStatus, {
    status: healthStatus.status === "healthy" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
