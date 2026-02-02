/**
 * @file logger.ts
 * @description Enhanced console logger with colored output and progress indicators
 * @author ComicWise Team
 * @date 2026-02-01
 */

import chalk from "chalk";

export type LogLevel = "debug" | "error" | "info" | "success" | "warn";

export interface ProgressOptions {
  current: number;
  label?: string;
  showPercentage?: boolean;
  total: number;
}

/**
 * Format timestamp for logs
 */
function timestamp(): string {
  return new Date().toISOString();
}

/**
 * Create progress bar visualization
 */
function createProgressBar(current: number, total: number, width = 20): string {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  const filledBar = "█".repeat(filled);
  const emptyBar = "░".repeat(empty);

  return `[${filledBar}${emptyBar}]`;
}

/**
 * Enhanced console logger with colors
 */
export class SeedLogger {
  private phase: string;
  private verbose: boolean;

  constructor(phase = "seed", verbose = true) {
    this.phase = phase;
    this.verbose = verbose;
  }

  /**
   * Log informational message
   */
  info(message: string, data?: Record<string, unknown>): void {
    console.log(
      chalk.blue("ℹ"),
      chalk.gray(`[${timestamp()}]`),
      chalk.cyan(`[${this.phase}]`),
      message,
      data ? chalk.gray(JSON.stringify(data, null, 2)) : ""
    );
  }

  /**
   * Log success message
   */
  success(message: string, data?: Record<string, unknown>): void {
    console.log(
      chalk.green("✓"),
      chalk.gray(`[${timestamp()}]`),
      chalk.cyan(`[${this.phase}]`),
      chalk.green(message),
      data ? chalk.gray(JSON.stringify(data, null, 2)) : ""
    );
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(
      chalk.yellow("⚠"),
      chalk.gray(`[${timestamp()}]`),
      chalk.cyan(`[${this.phase}]`),
      chalk.yellow(message),
      data ? chalk.gray(JSON.stringify(data, null, 2)) : ""
    );
  }

  /**
   * Log error message
   */
  error(message: string, data?: Error | Record<string, unknown>): void {
    const formattedData = data instanceof Error ? { error: data.message, stack: data.stack } : data;

    console.error(
      chalk.red("✖"),
      chalk.gray(`[${timestamp()}]`),
      chalk.cyan(`[${this.phase}]`),
      chalk.red(message),
      formattedData ? chalk.gray(JSON.stringify(formattedData, null, 2)) : ""
    );
  }

  /**
   * Log debug message (only if verbose)
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (!this.verbose) return;

    console.debug(
      chalk.magenta("⌘"),
      chalk.gray(`[${timestamp()}]`),
      chalk.cyan(`[${this.phase}]`),
      chalk.magenta(message),
      data ? chalk.gray(JSON.stringify(data, null, 2)) : ""
    );
  }

  /**
   * Log progress indicator
   */
  progress(options: ProgressOptions): void {
    const { current, total, label = "Progress", showPercentage = true } = options;
    const percentage = ((current / total) * 100).toFixed(1);
    const progressBar = createProgressBar(current, total);

    const percentageStr = showPercentage ? chalk.yellow(`${percentage}%`) : "";
    const countStr = chalk.gray(`(${current}/${total})`);

    process.stdout.write(
      `\r${chalk.blue("►")} ${chalk.cyan(label)}: ${progressBar} ${percentageStr} ${countStr}`
    );

    // Add newline when complete
    if (current >= total) {
      process.stdout.write("\n");
    }
  }

  /**
   * Log phase start with header
   */
  startPhase(phase: string): void {
    const separator = "═".repeat(60);
    console.log("\n" + chalk.cyan(separator));
    console.log(chalk.cyan.bold(`  ${phase.toUpperCase()}`));
    console.log(chalk.cyan(separator) + "\n");
  }

  /**
   * Log phase completion with summary
   */
  endPhase(phase: string, duration?: number): void {
    const durationStr = duration ? chalk.gray(`(${duration}ms)`) : "";
    console.log(
      "\n" + chalk.green("✓"),
      chalk.green.bold(`${phase} completed`),
      durationStr + "\n"
    );
  }

  /**
   * Create table output for structured data
   */
  table(data: Record<string, number | string>[]): void {
    if (data.length === 0) return;

    console.table(data);
  }

  /**
   * Set current phase
   */
  setPhase(phase: string): void {
    this.phase = phase;
  }
}

/**
 * Default singleton logger instance
 */
export const seedLogger = new SeedLogger("seed", process.env.NODE_ENV === "development");

/**
 * Create new logger instance with custom phase
 */
export function createLogger(phase: string, verbose = true): SeedLogger {
  return new SeedLogger(phase, verbose);
}
