import fs from "node:fs/promises";
import path from "node:path";

import { type z } from "zod";

import { clearDownloadCache } from "@/lib/image-helper";
import { loadJsonData } from "@/lib/seed-helpers";
import { UserSeedSchema } from "@/lib/validations/seed";

import { createLogger, SeedReportGenerator } from "./helpers";
import { REPORT_DIR } from "./seed-config";
import { seedArtists, seedAuthors, seedComics, seedGenres, seedTypes, seedUsers } from "./seeders";

export interface SeedOptions {
  dryRun?: boolean;
}

export interface SeedReport {
  dryRun: boolean;
  durationMs?: number;
  endTime?: Date;
  phases: PhaseReport[];
  startTime: Date;
  totalErrors: number;
  totalSeeded: number;
  totalSkipped: number;
}

interface PhaseReport {
  durationMs: number;
  errorCount: number;
  name: string;
  seeded: number;
  skipped: number;
}

/**
 * Extract unique entities from comics data
 */
function extractEntitiesFromComics(comics: Record<string, unknown>[]) {
  const authorsMap = new Map<string, { name: string }>();
  const artistsMap = new Map<string, { name: string }>();
  const genresMap = new Map<string, { name: string }>();
  const typesMap = new Map<string, { name: string }>();

  for (const comic of comics) {
    // Extract author
    const authorObj = comic.author as { name?: string } | undefined;
    if (authorObj && typeof authorObj.name === "string" && authorObj.name.trim()) {
      const name = authorObj.name.trim();
      authorsMap.set(name.toLowerCase(), { name });
    }

    // Extract artist
    const artistObj = comic.artist as { name?: string } | undefined;
    if (artistObj && typeof artistObj.name === "string" && artistObj.name.trim()) {
      const name = artistObj.name.trim();
      artistsMap.set(name.toLowerCase(), { name });
    }

    // Extract type
    const typeObj = comic.type as { name?: string } | undefined;
    if (typeObj && typeof typeObj.name === "string" && typeObj.name.trim()) {
      const name = typeObj.name.trim();
      typesMap.set(name.toLowerCase(), { name });
    }

    // Extract genres
    const genres = comic.genres as Array<{ name?: string }> | undefined;
    if (Array.isArray(genres)) {
      for (const g of genres) {
        if (g && typeof g.name === "string" && g.name.trim()) {
          const name = g.name.trim();
          genresMap.set(name.toLowerCase(), { name });
        }
      }
    }
  }

  return {
    authors: Array.from(authorsMap.values()),
    artists: Array.from(artistsMap.values()),
    genres: Array.from(genresMap.values()),
    types: Array.from(typesMap.values()),
  };
}

/**
 * Load comics data from JSON files
 */
async function loadComicsData(): Promise<Record<string, unknown>[]> {
  const comicFiles = ["data/seed-source/comics-merged.json", "data/seed-source/comics.json"];

  for (const file of comicFiles) {
    const filePath = path.resolve(file);
    try {
      const stat = await fs.stat(filePath).catch(() => null);
      if (stat) {
        const content = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch {
      // Skip missing files
    }
  }

  return [];
}

/**
 * Load chapter data from JSON files
 */
async function loadChapterData(): Promise<unknown[]> {
  const chapterFiles = ["data/seed-source/chapters-merged.json", "data/seed-source/chapters.json"];

  for (const file of chapterFiles) {
    const filePath = path.resolve(file);
    try {
      const stat = await fs.stat(filePath).catch(() => null);
      if (stat) {
        const content = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch {
      // Skip missing files
    }
  }

  return [];
}

async function main(options: SeedOptions = {}): Promise<SeedReport> {
  const { dryRun = false } = options;
  const logger = createLogger("seed", true);
  const reportGenerator = new SeedReportGenerator(dryRun ? "dry-run" : "full");

  const report: SeedReport = {
    startTime: new Date(),
    dryRun,
    phases: [],
    totalSeeded: 0,
    totalSkipped: 0,
    totalErrors: 0,
  };

  // Clear download cache at start
  clearDownloadCache();

  logger.info("=".repeat(60));
  logger.info("SEED ORCHESTRATOR " + (dryRun ? "(DRY RUN)" : ""));
  logger.info("=".repeat(60));

  try {
    // ===== PHASE 1: USERS =====
    logger.startPhase("USERS");
    reportGenerator.startPhase("users");
    const phaseStartUsers = Date.now();

    const usersPath = path.resolve("data/seed-source/users.json");
    const usersData = await loadJsonData<z.infer<typeof UserSeedSchema>[]>(usersPath, UserSeedSchema.array());
    const usersResult = await seedUsers({
      users: usersData,
      dryRun,
    });

    reportGenerator.endPhase("success", {
      processed: usersData.length,
      inserted: usersResult.seeded,
      skipped: usersResult.skipped,
    });
    report.phases.push({
      name: "users",
      seeded: usersResult.seeded,
      skipped: usersResult.skipped,
      errorCount: usersResult.errors.length,
      durationMs: Date.now() - phaseStartUsers,
    });
    report.totalSeeded += usersResult.seeded;
    report.totalSkipped += usersResult.skipped;
    report.totalErrors += usersResult.errors.length;
    logger.endPhase("users", Date.now() - phaseStartUsers);

    // ===== PHASE 2: LOAD COMICS DATA =====
    logger.startPhase("LOADING COMICS DATA");
    const comicsData = await loadComicsData();
    logger.success("Loaded " + comicsData.length + " comics from source");

    // ===== PHASE 3: EXTRACT AND SEED ENTITIES =====
    const extracted = extractEntitiesFromComics(comicsData);
    logger.info(
      "Extracted: " +
        extracted.authors.length +
        " authors, " +
        extracted.artists.length +
        " artists, " +
        extracted.genres.length +
        " genres, " +
        extracted.types.length +
        " types"
    );

    // Seed Authors
    logger.startPhase("AUTHORS");
    reportGenerator.startPhase("authors");
    const phaseStartAuthors = Date.now();
    const authorsResult = await seedAuthors({
      authors: extracted.authors,
      dryRun,
    });
    // Use idMap returned by seeder (avoids redundant DB query)
    const authorMap = authorsResult.idMap;
    reportGenerator.endPhase("success", {
      processed: extracted.authors.length,
      inserted: authorsResult.seeded,
      skipped: authorsResult.skipped,
    });
    report.phases.push({
      name: "authors",
      seeded: authorsResult.seeded,
      skipped: authorsResult.skipped,
      errorCount: authorsResult.errors.length,
      durationMs: Date.now() - phaseStartAuthors,
    });
    report.totalSeeded += authorsResult.seeded;
    report.totalSkipped += authorsResult.skipped;
    report.totalErrors += authorsResult.errors.length;
    logger.endPhase("authors", Date.now() - phaseStartAuthors);

    // Seed Artists
    logger.startPhase("ARTISTS");
    reportGenerator.startPhase("artists");
    const phaseStartArtists = Date.now();
    const artistsResult = await seedArtists({
      artists: extracted.artists,
      dryRun,
    });
    // Use idMap returned by seeder (avoids redundant DB query)
    const artistMap = artistsResult.idMap;
    reportGenerator.endPhase("success", {
      processed: extracted.artists.length,
      inserted: artistsResult.seeded,
      skipped: artistsResult.skipped,
    });
    report.phases.push({
      name: "artists",
      seeded: artistsResult.seeded,
      skipped: artistsResult.skipped,
      errorCount: artistsResult.errors.length,
      durationMs: Date.now() - phaseStartArtists,
    });
    report.totalSeeded += artistsResult.seeded;
    report.totalSkipped += artistsResult.skipped;
    report.totalErrors += artistsResult.errors.length;
    logger.endPhase("artists", Date.now() - phaseStartArtists);

    // Seed Genres
    logger.startPhase("GENRES");
    reportGenerator.startPhase("genres");
    const phaseStartGenres = Date.now();
    const genresResult = await seedGenres({
      genres: extracted.genres,
      dryRun,
    });
    // Use idMap returned by seeder (avoids redundant DB query)
    const genreMap = genresResult.idMap;
    reportGenerator.endPhase("success", {
      processed: extracted.genres.length,
      inserted: genresResult.seeded,
      skipped: genresResult.skipped,
    });
    report.phases.push({
      name: "genres",
      seeded: genresResult.seeded,
      skipped: genresResult.skipped,
      errorCount: genresResult.errors.length,
      durationMs: Date.now() - phaseStartGenres,
    });
    report.totalSeeded += genresResult.seeded;
    report.totalSkipped += genresResult.skipped;
    report.totalErrors += genresResult.errors.length;
    logger.endPhase("genres", Date.now() - phaseStartGenres);

    // Seed Types
    logger.startPhase("TYPES");
    reportGenerator.startPhase("types");
    const phaseStartTypes = Date.now();
    const typesResult = await seedTypes({
      types: extracted.types,
      dryRun,
    });
    // Use idMap returned by seeder (avoids redundant DB query)
    const typeMap = typesResult.idMap;
    reportGenerator.endPhase("success", {
      processed: extracted.types.length,
      inserted: typesResult.seeded,
      skipped: typesResult.skipped,
    });
    report.phases.push({
      name: "types",
      seeded: typesResult.seeded,
      skipped: typesResult.skipped,
      errorCount: typesResult.errors.length,
      durationMs: Date.now() - phaseStartTypes,
    });
    report.totalSeeded += typesResult.seeded;
    report.totalSkipped += typesResult.skipped;
    report.totalErrors += typesResult.errors.length;
    logger.endPhase("types", Date.now() - phaseStartTypes);

    // ===== PHASE 4: LOAD CHAPTERS DATA =====
    const chaptersData = await loadChapterData();
    logger.info("Loaded " + chaptersData.length + " chapters from source");

    // ===== PHASE 5: COMICS + CHAPTERS =====
    // Comics seeder will match chapters by slug/title and seed them
    logger.startPhase("COMICS");
    reportGenerator.startPhase("comics");
    const phaseStartComics = Date.now();
    const comicsResult = await seedComics({
      comics: comicsData,
      chapters: chaptersData,
      authorMap,
      artistMap,
      genreMap,
      typeMap,
      dryRun,
    });
    reportGenerator.endPhase("success", {
      processed: comicsData.length,
      inserted: comicsResult.seeded,
      skipped: comicsResult.skipped,
    });
    report.phases.push({
      name: "comics",
      seeded: comicsResult.seeded,
      skipped: comicsResult.skipped,
      errorCount: comicsResult.errors.length,
      durationMs: Date.now() - phaseStartComics,
    });
    report.totalSeeded += comicsResult.seeded;
    report.totalSkipped += comicsResult.skipped;
    report.totalErrors += comicsResult.errors.length;
    logger.endPhase("comics", Date.now() - phaseStartComics);

    // ===== PHASE 6: CHAPTERS (aggregated from comics seeder) =====
    const chaptersResult = comicsResult.chaptersResult;
    if (chaptersResult) {
      logger.startPhase("CHAPTERS");
      reportGenerator.startPhase("chapters");
      reportGenerator.endPhase("success", {
        processed: chaptersData.length,
        inserted: chaptersResult.seeded,
        skipped: chaptersResult.skipped,
      });
      report.phases.push({
        name: "chapters",
        seeded: chaptersResult.seeded,
        skipped: chaptersResult.skipped,
        errorCount: chaptersResult.errors.length,
        durationMs: 0, // Already included in comics phase
      });
      report.totalSeeded += chaptersResult.seeded;
      report.totalSkipped += chaptersResult.skipped;
      report.totalErrors += chaptersResult.errors.length;
      logger.endPhase("chapters", 0);
    } else {
      logger.info("No chapters matched any comics");
    }

    // ===== FINALIZE =====
    report.endTime = new Date();
    report.durationMs = report.endTime.getTime() - report.startTime.getTime();

    // Generate report
    await fs.mkdir(REPORT_DIR, { recursive: true });
    const timestamp = report.startTime.toISOString().replaceAll(/[:.]/g, "-");
    const reportPath = path.join(REPORT_DIR, "seed-report-" + timestamp + ".json");
    const textReportPath = path.join(REPORT_DIR, "seed-report-" + timestamp + ".txt");

    await reportGenerator.saveJsonReport(reportPath);
    await reportGenerator.saveTextReport(textReportPath);

    logger.info("=".repeat(60));
    logger.success("SEEDING COMPLETE");
    logger.info("Duration: " + (report.durationMs / 1000).toFixed(2) + "s");
    logger.info("Total Seeded: " + report.totalSeeded);
    logger.info("Total Skipped: " + report.totalSkipped);
    logger.info("Total Errors: " + report.totalErrors);
    logger.info("Reports: " + reportPath);
    logger.info("=".repeat(60));

    return report;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Fatal error during seeding: " + errorMessage);
    reportGenerator.addError("main", errorMessage);
    report.endTime = new Date();
    report.durationMs = report.endTime.getTime() - report.startTime.getTime();
    report.totalErrors++;
    throw err;
  }
}

export default main;

// CLI execution when run directly
if (process.argv[1]?.includes("main.ts") || process.argv[1]?.includes("main")) {
  const dryRun = process.argv.includes("--dry");
  main({ dryRun })
    .then((report) => {
      process.exit(report.totalErrors > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
