import { type NextRequest, NextResponse } from "next/server";

import seedMain from "@/database/seed/main";

export async function POST(request: NextRequest) {
  try {
    // Check for seed token
    const token = request.headers.get("x-seed-token") || request.nextUrl.searchParams.get("token");
    const expectedToken = process.env.SEED_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Seeding is not configured. Set SEED_TOKEN environment variable.",
        },
        { status: 500 }
      );
    }

    if (!token || token !== expectedToken) {
      return NextResponse.json({ success: false, error: "Invalid or missing seed token" }, { status: 401 });
    }

    // Check for dry-run flag
    const dryRun = request.nextUrl.searchParams.get("dry") === "true";

    // Execute seed
    const report = await seedMain({ dryRun });

    // Return success
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      report,
    });
  } catch (error) {
    console.error("Seed endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for seed token
    const token = request.nextUrl.searchParams.get("token");
    const expectedToken = process.env.SEED_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Seeding is not configured. Set SEED_TOKEN environment variable.",
        },
        { status: 500 }
      );
    }

    if (!token || token !== expectedToken) {
      return NextResponse.json({ success: false, error: "Invalid or missing seed token" }, { status: 401 });
    }

    // Check for dry-run flag
    const dryRun = request.nextUrl.searchParams.get("dry") === "true";

    // Execute seed
    const report = await seedMain({ dryRun });

    // Return success
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      report,
    });
  } catch (error) {
    console.error("Seed endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
