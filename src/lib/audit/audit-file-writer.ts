/**
 * Audit File Writer
 * @description Backup audit logs to files under logs/audit/
 */

import { appendFile, mkdir } from "fs/promises";
import { join } from "path";

const LOGS_DIR = join(process.cwd(), "logs", "audit");

interface AuditFileEntry {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  sessionId: string | null;
  timestamp: string;
}

/**
 * Ensure logs directory exists
 */
async function ensureLogsDir(): Promise<void> {
  try {
    await mkdir(LOGS_DIR, { recursive: true });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Get the log file path for today
 */
function getLogFilePath(): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return join(LOGS_DIR, `audit-${date}.jsonl`);
}

/**
 * Write an audit entry to the log file
 * Uses JSON Lines format (one JSON object per line)
 */
export async function writeAuditToFile(entry: AuditFileEntry): Promise<void> {
  try {
    await ensureLogsDir();

    const filePath = getLogFilePath();
    const line = JSON.stringify(entry) + "\n";

    await appendFile(filePath, line, "utf-8");
  } catch (error) {
    // Log error but don't throw - file backup is secondary
    console.error("[AuditFileWriter] Failed to write audit log:", error);
  }
}

/**
 * Batch write multiple audit entries
 */
export async function writeAuditBatch(entries: AuditFileEntry[]): Promise<void> {
  if (entries.length === 0) return;

  try {
    await ensureLogsDir();

    const filePath = getLogFilePath();
    const lines = entries.map((entry) => JSON.stringify(entry)).join("\n") + "\n";

    await appendFile(filePath, lines, "utf-8");
  } catch (error) {
    console.error("[AuditFileWriter] Failed to write audit batch:", error);
  }
}
