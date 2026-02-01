import { SEED_API_KEY } from "@/database/seed/seed-config";
import { exec } from "child_process";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SeedRequestBody {
  dryRun?: boolean;
  stream?: boolean;
}

/**
 * POST /api/dev/seed
 * Triggers the database seeding process
 *
 * Headers:
 *   x-seed-api-key: API key for authorization
 *
 * Body (optional):
 *   dryRun: boolean - Skip database writes if true
 *   stream: boolean - Use Server-Sent Events for progress updates
 *
 * Query params (alternative):
 *   key: API key
 *   dry: Enable dry-run mode
 *   stream: Enable SSE streaming
 */
export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const key = req.headers.get("x-seed-api-key") || url.searchParams.get("key");

  if (!key || key !== SEED_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse options from body or query params
  let options: SeedRequestBody = {};
  try {
    const contentType = req.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      options = await req.json();
    }
  } catch {
    // Ignore JSON parse errors, use defaults
  }

  const dryRun = options.dryRun ?? url.searchParams.get("dry") === "true";
  const stream = options.stream ?? url.searchParams.get("stream") === "true";

  // Build command with appropriate flags
  const flags: string[] = [];
  if (dryRun) flags.push("--dry");

  // Stream mode uses Server-Sent Events
  if (stream) {
    return streamSeedProcess(flags);
  }

  // Non-streaming mode returns JSON when complete
  return runSeedProcess(flags);
}

/**
 * Run seed process and return JSON response when complete
 */
function runSeedProcess(flags: string[]): Promise<Response> {
  const command = `pnpm tsx src/database/seed/dynamic-seed.ts ${flags.join(" ")}`.trim();

  return new Promise<Response>((resolve) => {
    exec(command, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        resolve(
          NextResponse.json(
            {
              ok: false,
              error: stderr || err.message,
              output: stdout,
            },
            { status: 500 }
          )
        );
      } else {
        // Parse JSON logs from stdout
        const logs = parseJsonLogs(stdout);
        resolve(
          NextResponse.json({
            ok: true,
            logs,
            output: stdout,
          })
        );
      }
    });
  });
}

/**
 * Stream seed process output using Server-Sent Events
 */
function streamSeedProcess(flags: string[]): Response {
  const command = `pnpm tsx src/database/seed/dynamic-seed.ts ${flags.join(" ")}`.trim();

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      const childProcess = exec(command, { maxBuffer: 10 * 1024 * 1024 });

      const sendEvent = (type: string, data: unknown) => {
        const event = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(event));
      };

      // Send initial event
      sendEvent("start", { timestamp: new Date().toISOString() });

      // Stream stdout line by line
      childProcess.stdout?.on("data", (chunk: Buffer) => {
        const lines = chunk.toString().split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            sendEvent("progress", parsed);
          } catch {
            sendEvent("log", { message: line });
          }
        }
      });

      // Stream stderr
      childProcess.stderr?.on("data", (chunk: Buffer) => {
        sendEvent("error", { message: chunk.toString() });
      });

      // Handle completion
      childProcess.on("close", (code) => {
        sendEvent("complete", {
          code,
          success: code === 0,
          timestamp: new Date().toISOString(),
        });
        controller.close();
      });

      // Handle errors
      childProcess.on("error", (err) => {
        sendEvent("error", { message: err.message });
        controller.close();
      });
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/**
 * Parse JSON log lines from seed output
 */
function parseJsonLogs(output: string): unknown[] {
  const logs: unknown[] = [];
  const lines = output.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        logs.push(JSON.parse(trimmed));
      } catch {
        // Skip non-JSON lines
      }
    }
  }

  return logs;
}
