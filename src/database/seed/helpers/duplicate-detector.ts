import { type comic } from "../../schema";

type Comic = typeof comic.$inferSelect;

export interface DuplicateConflict {
  comics: Array<{
    description?: string;
    id?: number;
    slug: string;
    source?: string;
    title: string;
  }>;
  field: "metadata" | "slug" | "title";
  recommendation: string;
  severity: "critical" | "info" | "warning";
  value: string;
}

export interface DuplicateDetectionResult {
  conflicts: DuplicateConflict[];
  hasDuplicates: boolean;
  summary: {
    conflictsByField: Record<string, number>;
    duplicateCount: number;
    totalComics: number;
    uniqueComics: number;
  };
  uniqueComics: Array<Partial<Comic>>;
}

/**
 * Normalize string for comparison (lowercase, trim, remove extra spaces)
 */
function normalizeString(str: string): string {
  return str.toLowerCase().trim().replaceAll(/\s+/g, " ");
}

/**
 * Normalize slug for comparison (lowercase, remove special chars except hyphens)
 */
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9-]/g, "");
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * @returns Similarity percentage (0-100)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 100.0;
  }

  // Simple Levenshtein distance implementation
  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) {
      costs[shorter.length] = lastValue;
    }
  }

  const distance = costs[shorter.length];
  return ((longer.length - distance) / longer.length) * 100;
}

/**
 * Detect duplicate comics by slug
 */
function detectSlugDuplicates(comics: Array<Partial<Comic>>): Map<string, Array<Partial<Comic>>> {
  const slugMap = new Map<string, Array<Partial<Comic>>>();

  for (const comic of comics) {
    if (!comic.slug) continue;

    const normalizedSlug = normalizeSlug(comic.slug);
    const existing = slugMap.get(normalizedSlug) || [];
    existing.push(comic);
    slugMap.set(normalizedSlug, existing);
  }

  // Filter to only entries with duplicates
  const duplicates = new Map<string, Array<Partial<Comic>>>();
  for (const [slug, comicList] of slugMap.entries()) {
    if (comicList.length > 1) {
      duplicates.set(slug, comicList);
    }
  }

  return duplicates;
}

/**
 * Detect similar titles (fuzzy matching)
 */
function detectTitleDuplicates(
  comics: Array<Partial<Comic>>,
  similarityThreshold: number = 90
): Map<string, Array<Partial<Comic>>> {
  const titleGroups = new Map<string, Array<Partial<Comic>>>();
  const processed = new Set<string>();

  for (let i = 0; i < comics.length; i++) {
    const comic1 = comics[i];
    if (!comic1.title || processed.has(comic1.slug || `${i}`)) continue;

    const normalizedTitle1 = normalizeString(comic1.title);
    const similarComics: Array<Partial<Comic>> = [comic1];

    for (let j = i + 1; j < comics.length; j++) {
      const comic2 = comics[j];
      if (!comic2.title || processed.has(comic2.slug || `${j}`)) continue;

      const normalizedTitle2 = normalizeString(comic2.title);
      const similarity = calculateSimilarity(normalizedTitle1, normalizedTitle2);

      if (similarity >= similarityThreshold) {
        similarComics.push(comic2);
        processed.add(comic2.slug || `${j}`);
      }
    }

    if (similarComics.length > 1) {
      titleGroups.set(normalizedTitle1, similarComics);
      processed.add(comic1.slug || `${i}`);
    }
  }

  return titleGroups;
}

/**
 * Main duplicate detection function with "skip duplicates" strategy
 * @param comics - Array of comics to check
 * @param options - Detection options
 * @returns Detailed duplicate detection results with unique comics only
 */
export function detectDuplicates(
  comics: Array<Partial<Comic>>,
  options: {
    checkSlugs?: boolean;
    checkTitles?: boolean;
    titleSimilarityThreshold?: number;
  } = {}
): DuplicateDetectionResult {
  const { checkSlugs = true, checkTitles = true, titleSimilarityThreshold = 90 } = options;

  const conflicts: DuplicateConflict[] = [];
  const seen = new Set<string>();
  const uniqueComics: Array<Partial<Comic>> = [];

  // 1. Detect slug duplicates (critical) - Keep first, skip rest
  if (checkSlugs) {
    const slugDuplicates = detectSlugDuplicates(comics);

    for (const comic of comics) {
      if (!comic.slug) continue;

      const normalizedSlug = normalizeSlug(comic.slug);

      if (seen.has(normalizedSlug)) {
        // Skip duplicate
        continue;
      }

      seen.add(normalizedSlug);
      uniqueComics.push(comic);

      // Log conflict if this slug has duplicates
      if (slugDuplicates.has(normalizedSlug)) {
        const duplicateComics = slugDuplicates.get(normalizedSlug)!;
        conflicts.push({
          field: "slug",
          value: normalizedSlug,
          comics: duplicateComics.map((c) => ({
            id: c.id,
            slug: c.slug || "",
            title: c.title || "",
            description: c.description || undefined,
            source: "seed data",
          })),
          severity: "critical",
          recommendation: `Slug "${normalizedSlug}" used by ${
            duplicateComics.length
          } comics. Kept first occurrence, skipped ${duplicateComics.length - 1} duplicates.`,
        });
      }
    }
  } else {
    // If not checking slugs, pass all through
    uniqueComics.push(...comics);
  }

  // 2. Detect title duplicates (warning) - informational only
  if (checkTitles && uniqueComics.length > 0) {
    const titleDuplicates = detectTitleDuplicates(uniqueComics, titleSimilarityThreshold);
    for (const [title, duplicateComics] of titleDuplicates.entries()) {
      const similarity = duplicateComics.length > 1 ? "90%+" : "exact";
      conflicts.push({
        field: "title",
        value: title,
        comics: duplicateComics.map((c) => ({
          id: c.id,
          slug: c.slug || "",
          title: c.title || "",
          description: c.description || undefined,
          source: "seed data",
        })),
        severity: "warning",
        recommendation: `${duplicateComics.length} comics have ${similarity} similar titles. Verify these are not duplicates or add distinguishing information.`,
      });
    }
  }

  // Calculate summary
  const conflictsByField = conflicts.reduce(
    (acc, conflict) => {
      acc[conflict.field] = (acc[conflict.field] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const duplicateCount = comics.length - uniqueComics.length;

  return {
    hasDuplicates: conflicts.length > 0,
    conflicts,
    uniqueComics,
    summary: {
      totalComics: comics.length,
      uniqueComics: uniqueComics.length,
      duplicateCount,
      conflictsByField,
    },
  };
}

/**
 * Generate a detailed duplicate detection report
 */
export function generateDuplicateReport(result: DuplicateDetectionResult): string {
  const lines: string[] = [];

  lines.push("=".repeat(80));
  lines.push("DUPLICATE DETECTION REPORT");
  lines.push("=".repeat(80));
  lines.push("");

  // Summary
  lines.push("SUMMARY:");
  lines.push(`  Total Comics: ${result.summary.totalComics}`);
  lines.push(`  Unique Comics: ${result.summary.uniqueComics}`);
  lines.push(`  Duplicates Skipped: ${result.summary.duplicateCount}`);
  lines.push(`  Total Conflicts Logged: ${result.conflicts.length}`);
  lines.push("");

  if (result.summary.conflictsByField && Object.keys(result.summary.conflictsByField).length > 0) {
    lines.push("CONFLICTS BY FIELD:");
    for (const [field, count] of Object.entries(result.summary.conflictsByField)) {
      lines.push(`  ${field}: ${count}`);
    }
    lines.push("");
  }

  // Detailed conflicts
  if (result.conflicts.length > 0) {
    lines.push("DETAILED CONFLICTS:");
    lines.push("");

    const critical = result.conflicts.filter((c) => c.severity === "critical");
    const warnings = result.conflicts.filter((c) => c.severity === "warning");

    if (critical.length > 0) {
      lines.push("🔴 CRITICAL (Duplicates Skipped):");
      for (const [idx, conflict] of critical.entries()) {
        lines.push(`  ${idx + 1}. ${conflict.field.toUpperCase()}: ${conflict.value}`);
        lines.push(
          `     Affected: ${conflict.comics.length} comics (kept first, skipped ${conflict.comics.length - 1})`
        );
        for (const [i, comic] of conflict.comics.entries()) {
          const status = i === 0 ? "✅ KEPT" : "⏭️  SKIPPED";
          lines.push(`     ${status}: ${comic.title} (${comic.slug})`);
        }
        lines.push(`     💡 ${conflict.recommendation}`);
        lines.push("");
      }
    }

    if (warnings.length > 0) {
      lines.push("🟡 WARNINGS (Review Recommended):");
      for (const [idx, conflict] of warnings.entries()) {
        lines.push(`  ${idx + 1}. ${conflict.field.toUpperCase()}: ${conflict.value}`);
        lines.push(`     Affected: ${conflict.comics.length} comics`);
        for (const comic of conflict.comics) {
          lines.push(`     - ${comic.title} (${comic.slug})`);
        }
        lines.push(`     💡 ${conflict.recommendation}`);
        lines.push("");
      }
    }
  } else {
    lines.push("✅ No duplicates detected!");
  }

  lines.push("=".repeat(80));

  return lines.join("\n");
}
