import { SEED_API_KEY } from "@/database/seed/seed-config";
import { exec } from "child_process";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const key = req.headers.get("x-seed-api-key") || req.nextUrl.searchParams.get("key");
  if (!key || key !== SEED_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Run the dynamic seeder as a child process
  return new Promise((resolve) => {
    exec("pnpm tsx src/database/seed/dynamic-seed.ts", (err, stdout, stderr) => {
      if (err) {
        resolve(NextResponse.json({ error: stderr || err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ ok: true, output: stdout }));
      }
    });
  });
}
