import { db } from "@/database/db";
import type { Table } from "drizzle-orm";

export interface SeedDataItem {
  [key: string]: unknown;
}

/**
 * Load and parse JSON seed data
 */
export async function loadSeedData(filePath: string): Promise<SeedDataItem[]> {
  try {
    const data = await import(filePath);
    return Array.isArray(data.default) ? data.default : data.default.data;
  } catch (error) {
    console.error(`Failed to load seed data from ${filePath}:`, error);
    return [];
  }
}

/**
 * Batch insert records into table
 */
export async function batchInsert(
  table: Table,
  records: SeedDataItem[],
  batchSize: number = 100
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (records.length === 0) {
      return { success: true, count: 0 };
    }

    let inserted = 0;

    // Process in batches
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      try {
        await db.insert(table).values(batch).onConflictDoNothing();
        inserted += batch.length;
      } catch (error) {
        console.error(`Batch ${i / batchSize} insert failed:`, error);
      }
    }

    return { success: true, count: inserted };
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: String(error),
    };
  }
}

/**
 * Clear table (use with caution)
 */
export async function clearTable(table: Table): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(table);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Seed execution report
 */
export interface SeedReport {
  table: string;
  records: number;
  status: "success" | "failed";
  error?: string;
}

export function generateSeedReport(reports: SeedReport[]): string {
  const lines = [
    "╔════════════════════════════════════════════════════════════╗",
    "║              DATABASE SEED COMPLETE                        ║",
    "╚════════════════════════════════════════════════════════════╝",
    "",
  ];

  const totalRecords = reports.reduce((sum, r) => sum + r.records, 0);
  const successCount = reports.filter((r) => r.status === "success").length;

  reports.forEach((report) => {
    const icon = report.status === "success" ? "✓" : "✗";
    lines.push(
      `${icon} ${report.table.padEnd(20)} ${report.records.toString().padStart(6)} records`
    );
    if (report.error) {
      lines.push(`  Error: ${report.error}`);
    }
  });

  lines.push("");
  lines.push(`Total Records: ${totalRecords}`);
  lines.push(`Success: ${successCount}/${reports.length}`);

  return lines.join("\n");
}
