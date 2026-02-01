/**
 * @file report-generator.ts
 * @description Generate seed execution reports in JSON and text formats
 * @author ComicWise Team
 * @date 2026-02-01
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { getDeduplicationStats } from "./image-deduplicator";

export interface SeedReport {
  timestamp: string;
  duration: number;
  mode: "dry-run" | "full";
  phases: PhaseReport[];
  summary: SeedSummary;
  errors: ErrorLog[];
}

export interface PhaseReport {
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: "success" | "failed" | "skipped";
  itemsProcessed: number;
  itemsSkipped: number;
  itemsInserted: number;
  itemsUpdated: number;
  warnings: string[];
}

export interface SeedSummary {
  totalItems: number;
  totalInserted: number;
  totalUpdated: number;
  totalSkipped: number;
  totalErrors: number;
  totalWarnings: number;
  imagesDownloaded?: number;
  imagesDeduplicated?: number;
  storageSavedMB?: string;
}

export interface ErrorLog {
  phase: string;
  timestamp: string;
  error: string;
  context?: Record<string, unknown>;
}

/**
 * Report generator class
 */
export class SeedReportGenerator {
  private report: SeedReport;
  private startTime: number;
  private currentPhase: PhaseReport | null = null;

  constructor(mode: "dry-run" | "full" = "full") {
    this.startTime = Date.now();
    this.report = {
      timestamp: new Date().toISOString(),
      duration: 0,
      mode,
      phases: [],
      summary: {
        totalItems: 0,
        totalInserted: 0,
        totalUpdated: 0,
        totalSkipped: 0,
        totalErrors: 0,
        totalWarnings: 0,
      },
      errors: [],
    };
  }

  /**
   * Start tracking a new phase
   */
  startPhase(name: string): void {
    this.currentPhase = {
      name,
      startTime: new Date().toISOString(),
      endTime: "",
      duration: 0,
      status: "success",
      itemsProcessed: 0,
      itemsSkipped: 0,
      itemsInserted: 0,
      itemsUpdated: 0,
      warnings: [],
    };
  }

  /**
   * End current phase and calculate stats
   */
  endPhase(
    status: "success" | "failed" | "skipped" = "success",
    stats?: {
      processed?: number;
      inserted?: number;
      updated?: number;
      skipped?: number;
    }
  ): void {
    if (!this.currentPhase) return;

    const endTime = Date.now();
    this.currentPhase.endTime = new Date().toISOString();
    this.currentPhase.status = status;

    if (stats) {
      this.currentPhase.itemsProcessed = stats.processed || 0;
      this.currentPhase.itemsInserted = stats.inserted || 0;
      this.currentPhase.itemsUpdated = stats.updated || 0;
      this.currentPhase.itemsSkipped = stats.skipped || 0;
    }

    this.currentPhase.duration = endTime - new Date(this.currentPhase.startTime).getTime();
    this.report.phases.push(this.currentPhase);
    this.currentPhase = null;
  }

  /**
   * Add warning to current phase
   */
  addWarning(message: string): void {
    if (this.currentPhase) {
      this.currentPhase.warnings.push(message);
    }
  }

  /**
   * Log error
   */
  addError(phase: string, error: string, context?: Record<string, unknown>): void {
    this.report.errors.push({
      phase,
      timestamp: new Date().toISOString(),
      error,
      context,
    });
    this.report.summary.totalErrors++;
  }

  /**
   * Set image deduplication stats
   */
  setDeduplicationStats(stats: Awaited<ReturnType<typeof getDeduplicationStats>>): void {
    this.report.summary.imagesDeduplicated = stats.duplicates;
    this.report.summary.storageSavedMB = stats.storageSavedMB;
  }

  /**
   * Calculate final summary
   */
  private calculateSummary(): void {
    const { phases } = this.report;

    this.report.summary.totalItems = phases.reduce((sum, p) => sum + p.itemsProcessed, 0);
    this.report.summary.totalInserted = phases.reduce((sum, p) => sum + p.itemsInserted, 0);
    this.report.summary.totalUpdated = phases.reduce((sum, p) => sum + p.itemsUpdated, 0);
    this.report.summary.totalSkipped = phases.reduce((sum, p) => sum + p.itemsSkipped, 0);
    this.report.summary.totalWarnings = phases.reduce((sum, p) => sum + p.warnings.length, 0);

    this.report.duration = Date.now() - this.startTime;
  }

  /**
   * Generate JSON report
   */
  async saveJsonReport(outputPath: string): Promise<void> {
    this.calculateSummary();

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(this.report, null, 2), "utf8");
  }

  /**
   * Generate human-readable text report
   */
  async saveTextReport(outputPath: string): Promise<void> {
    this.calculateSummary();

    const lines: string[] = [];

    // Header
    lines.push("═".repeat(70));
    lines.push("                    SEED EXECUTION REPORT");
    lines.push("═".repeat(70));
    lines.push("");

    // Metadata
    lines.push(`Timestamp:  ${this.report.timestamp}`);
    lines.push(`Duration:   ${(this.report.duration / 1000).toFixed(2)}s`);
    lines.push(`Mode:       ${this.report.mode.toUpperCase()}`);
    lines.push("");

    // Summary
    lines.push("─".repeat(70));
    lines.push("SUMMARY");
    lines.push("─".repeat(70));
    lines.push(`Total Items:      ${this.report.summary.totalItems}`);
    lines.push(`  • Inserted:     ${this.report.summary.totalInserted}`);
    lines.push(`  • Updated:      ${this.report.summary.totalUpdated}`);
    lines.push(`  • Skipped:      ${this.report.summary.totalSkipped}`);
    lines.push(`Errors:           ${this.report.summary.totalErrors}`);
    lines.push(`Warnings:         ${this.report.summary.totalWarnings}`);

    if (this.report.summary.imagesDeduplicated !== undefined) {
      lines.push("");
      lines.push(`Images Deduplicated:  ${this.report.summary.imagesDeduplicated}`);
      lines.push(`Storage Saved:        ${this.report.summary.storageSavedMB} MB`);
    }
    lines.push("");

    // Phases
    lines.push("─".repeat(70));
    lines.push("PHASES");
    lines.push("─".repeat(70));

    for (const phase of this.report.phases) {
      const statusSymbol = phase.status === "success" ? "✓" : phase.status === "failed" ? "✖" : "⊘";
      lines.push(
        `${statusSymbol} ${phase.name.toUpperCase()} (${(phase.duration / 1000).toFixed(2)}s)`
      );
      lines.push(`  Status:       ${phase.status}`);
      lines.push(`  Processed:    ${phase.itemsProcessed}`);
      lines.push(`  Inserted:     ${phase.itemsInserted}`);
      lines.push(`  Updated:      ${phase.itemsUpdated}`);
      lines.push(`  Skipped:      ${phase.itemsSkipped}`);

      if (phase.warnings.length > 0) {
        lines.push(`  Warnings (${phase.warnings.length}):`);
        phase.warnings.forEach((w) => lines.push(`    - ${w}`));
      }

      lines.push("");
    }

    // Errors
    if (this.report.errors.length > 0) {
      lines.push("─".repeat(70));
      lines.push("ERRORS");
      lines.push("─".repeat(70));

      for (const error of this.report.errors) {
        lines.push(`✖ [${error.phase}] ${error.timestamp}`);
        lines.push(`  ${error.error}`);
        if (error.context) {
          lines.push(`  Context: ${JSON.stringify(error.context)}`);
        }
        lines.push("");
      }
    }

    // Footer
    lines.push("═".repeat(70));

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, lines.join("\n"), "utf8");
  }

  /**
   * Get current report data
   */
  getReport(): SeedReport {
    this.calculateSummary();
    return this.report;
  }
}

/**
 * Create new report generator
 */
export function createReportGenerator(mode: "dry-run" | "full" = "full"): SeedReportGenerator {
  return new SeedReportGenerator(mode);
}
