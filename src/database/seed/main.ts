import { clearDownloadCache, downloadAndSaveImage } from "@/lib/image-helper";
import { loadJsonData, seedTableBatched } from "@/lib/seed-helpers";
import { ChapterSeedSchema, ComicSeedSchema, UserSeedSchema } from "@/lib/validations/seed";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import type { z } from "zod";
import { db } from "../db";
import { chapter, comic, user } from "../schema";
import * as config from "./seed-config";

export interface SeedOptions {
  dryRun?: boolean;
}

async function main(options: SeedOptions = {}): Promise<void> {
  const { dryRun = false } = options;

  // Clear the download cache at the start of each run
  clearDownloadCache();

  // Type for DB insert (publicationDate as Date)
  type ComicInsert = Omit<z.infer<typeof ComicSeedSchema>, "id" | "publicationDate"> & {
    publicationDate: Date;
  };
  const log = (event: string, data?: Record<string, unknown>) => {
    const entry: {
      event: string;
      timestamp: string;
      dryRun: boolean;
      data?: Record<string, unknown>;
    } = {
      event,
      timestamp: new Date().toISOString(),
      dryRun,
      ...(data ? { data } : {}),
    };
    if (event === "error") {
      console.error("[SEED]", JSON.stringify(entry));
    } else {
      console.info("[SEED]", JSON.stringify(entry));
    }
  };

  log("start", { phase: "seeding", mode: dryRun ? "dry-run" : "full" });

  // Declare shared state outside transactions for cross-phase access
  type ComicSeed = z.infer<typeof ComicSeedSchema>;
  let allRawComics: ComicSeed[] = [];

  try {
    // --- USERS (Transaction Wrapped) ---
    await db.transaction(async (_tx) => {
      log("start", { phase: "users", transaction: true });
      const usersPath = path.resolve("data/seed-source/users.json");
      const users = await loadJsonData<z.infer<typeof UserSeedSchema>[]>(
        usersPath,
        UserSeedSchema.array()
      );
      const passwordHash = await bcrypt.hash(config.CUSTOM_PASSWORD, 10);
      const usersWithHash = users.map(
        (
          u: z.infer<typeof UserSeedSchema>
        ): z.infer<typeof UserSeedSchema> & { password: string } => ({
          ...u,
          password: passwordHash,
        })
      );
      log("progress", { phase: "users", count: usersWithHash.length });
      await seedTableBatched({
        table: user,
        items: usersWithHash,
        conflictKeys: [user.id],
        updateFields: [
          { name: "name", value: undefined },
          { name: "email", value: undefined },
          { name: "image", value: undefined },
          { name: "password", value: undefined },
        ],
        dryRun,
      });
      log("complete", { phase: "users", transaction: true });
    });

    // --- COMICS (Transaction Wrapped) ---
    await db.transaction(async (_tx) => {
      log("start", { phase: "comics", transaction: true });
      const comicFiles = [
        "data/seed-source/comics.json",
        "data/seed-source/comicsdata1.json",
        "data/seed-source/comicsdata2.json",
      ];
      // allRawComics is declared outside transactions for cross-phase access
      for (const file of comicFiles) {
        const filePath = path.resolve(file);
        try {
          if (
            await fs.stat(filePath).then(
              () => true,
              () => false
            )
          ) {
            const data: unknown = JSON.parse(await fs.readFile(filePath, "utf8"));
            if (Array.isArray(data)) allRawComics.push(...(data as ComicSeed[]));
          }
        } catch (err: unknown) {
          log("error", {
            phase: "comics",
            file,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
      const todayISO = new Date().toISOString();
      // Track comics with invalid genres for logging
      const comicsWithInvalidGenres: Array<{
        idx: number;
        id: string | number | undefined;
        slug?: string;
        title?: string;
        genres: unknown;
      }> = [];
      allRawComics = allRawComics.map((comic: ComicSeed, idx: number): ComicSeed => {
        let coverImage = comic.coverImage;
        if (!coverImage || typeof coverImage !== "string" || coverImage.trim() === "") {
          coverImage = config.PLACEHOLDER_COMIC;
        }
        // Normalize genres: ensure all are strings, extract .name or .id if needed
        let genres: string[] = [];
        if (Array.isArray(comic.genres)) {
          genres = comic.genres.map((g: string | { name?: string; id?: string }) => {
            if (typeof g === "string") return g;
            if (g && typeof g === "object" && typeof g.name === "string" && g.name.trim() !== "")
              return g.name;
            if (g && typeof g === "object" && typeof g.id === "string" && g.id.trim() !== "")
              return g.id;
            return "";
          });
          // If any genre is not a string or is an object, log for reporting
          if (comic.genres.some((g: unknown) => typeof g !== "string")) {
            comicsWithInvalidGenres.push({
              idx,
              id: comic.id,
              slug: comic.slug,
              title: comic.title,
              genres: comic.genres,
            });
          }
        }
        // Build the comic object
        const result = {
          ...comic,
          id: typeof comic.id === "number" ? comic.id : idx + 1,
          authorId: typeof comic.authorId === "number" ? comic.authorId : 1,
          genres,
          coverImage,
        };
        // Guarantee publicationDate is a valid ISO string after all assignments
        const publicationDate = result.publicationDate;
        if (
          !publicationDate ||
          typeof publicationDate !== "string" ||
          publicationDate.trim() === "" ||
          publicationDate === "null" ||
          publicationDate === null
        ) {
          result.publicationDate = todayISO;
        } else {
          // Try to parse and reformat if not ISO
          const d = new Date(publicationDate);
          if (isNaN(d.getTime())) {
            result.publicationDate = todayISO;
          } else {
            result.publicationDate = d.toISOString();
          }
        }
        // Final hardening: never allow null/undefined publicationDate
        if (
          !result.publicationDate ||
          typeof result.publicationDate !== "string" ||
          result.publicationDate.trim() === "" ||
          result.publicationDate === "null" ||
          result.publicationDate === null
        ) {
          result.publicationDate = todayISO;
        }
        return result;
      });
      if (comicsWithInvalidGenres.length > 0) {
        log("error", {
          phase: "comics-transform",
          invalidGenres: comicsWithInvalidGenres.map(
            (c: {
              idx: number;
              id: string | number | undefined;
              slug?: string;
              title?: string;
              genres: unknown;
            }) => ({
              idx: c.idx,
              id: c.id,
              slug: c.slug,
              title: c.title,
              genres: c.genres,
            })
          ),
          message:
            "Some comics had non-string genres. Genres were normalized, but please review the data for correctness.",
        });
      }
      // Log and SKIP any comics still missing or have invalid publicationDate (should be none)
      const missingPubDate = allRawComics.filter(
        (c: ComicSeed): boolean =>
          !c.publicationDate ||
          typeof c.publicationDate !== "string" ||
          c.publicationDate.trim() === "" ||
          c.publicationDate === "null" ||
          c.publicationDate === null
      );
      if (missingPubDate.length > 0) {
        log("error", {
          phase: "comics-transform",
          missingPublicationDate: missingPubDate.map((c: ComicSeed) => ({
            id: c.id,
            slug: c.slug,
            title: c.title,
            publicationDate: c.publicationDate,
          })),
          message:
            "Some comics are missing or have invalid publicationDate after normalization. These will be skipped.",
        });
      }
      // Only keep comics with valid publicationDate
      allRawComics = allRawComics.filter((c: ComicSeed): boolean => {
        return (
          typeof c.publicationDate === "string" &&
          c.publicationDate.trim() !== "" &&
          c.publicationDate !== "null" &&
          c.publicationDate !== null
        );
      });
      let comics: ComicSeed[] = [];
      try {
        comics = ComicSeedSchema.array().parse(allRawComics);
      } catch (err: unknown) {
        log("error", {
          phase: "comics-validate",
          error: err instanceof Error ? (err as Error).message : err,
        });
        throw err;
      }
      // Log the final comics array before DB insert to verify publicationDate
      log("pre-insert", {
        phase: "comics",
        count: comics.length,
        sample: comics.slice(0, 10).map((c: ComicSeed) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          publicationDate: c.publicationDate,
        })),
        allPublicationDatesValid: comics.every(
          (c: ComicSeed) =>
            typeof c.publicationDate === "string" &&
            c.publicationDate.trim() !== "" &&
            c.publicationDate !== "null" &&
            c.publicationDate !== null
        ),
      });
      // Deduplicate comics by title (keep first occurrence)
      const seenTitles = new Set<string>();
      const dedupedComics: typeof comics = [];
      const skippedComics: typeof comics = [];
      for (const c of comics) {
        if (typeof c.title === "string" && !seenTitles.has(c.title)) {
          seenTitles.add(c.title);
          dedupedComics.push(c);
        } else {
          skippedComics.push(c);
        }
      }
      if (skippedComics.length > 0) {
        log("warning", {
          phase: "comics-deduplication",
          skippedCount: skippedComics.length,
          skippedTitles: skippedComics.map((c: ComicSeed) => c.title),
          message:
            "Duplicate comic titles found and skipped. Only the first occurrence of each title is inserted.",
        });
      }
      // Convert publicationDate from string to Date object for DB insert, keep id for validation and logic
      const comicsForInsertFull = dedupedComics.map((c: ComicSeed) => ({
        ...c,
        publicationDate:
          typeof c.publicationDate === "string" ? new Date(c.publicationDate) : c.publicationDate,
      }));
      // Only strip id in the final array passed to seedTableBatched
      const comicsForInsert = comicsForInsertFull.map((comic) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = comic;
        return rest as ComicInsert;
      });
      log("progress", { phase: "comics", count: comicsForInsert.length });
      // Download cover images in parallel (skip in dry-run mode)
      if (!dryRun) {
        await Promise.all(
          comicsForInsert.map(async (comic: ComicInsert) => {
            if (comic.coverImage) {
              try {
                comic.coverImage = await downloadAndSaveImage({
                  url: comic.coverImage,
                  destDir: config.COMICS_COVER_DIR + "/" + comic.slug,
                  filename: path.basename(comic.coverImage),
                  fallback: config.PLACEHOLDER_COMIC,
                });
              } catch (err: unknown) {
                log("error", {
                  phase: "comic-image",
                  slug: comic.slug,
                  error: err instanceof Error ? (err as Error).message : err,
                });
                comic.coverImage = config.PLACEHOLDER_COMIC;
              }
            }
          })
        );
      } else {
        log("progress", { phase: "comics", message: "Skipping image downloads (dry-run)" });
      }
      await seedTableBatched({
        table: comic,
        items: comicsForInsert,
        // Use title as the conflict target for upsert
        conflictKeys: [comic.title],
        updateFields: [
          { name: "slug", value: undefined },
          { name: "authorId", value: undefined },
          { name: "artistId", value: undefined },
          { name: "coverImage", value: undefined },
          { name: "description", value: undefined },
          { name: "publicationDate", value: undefined },
        ],
        dryRun,
      });
      log("complete", { phase: "comics", transaction: true });
    });

    // --- CHAPTERS (Transaction Wrapped) ---
    await db.transaction(async (_tx) => {
      log("start", { phase: "chapters", transaction: true });
      const chapterFiles = [
        "data/seed-source/chapters.json",
        "data/seed-source/chaptersdata1.json",
        "data/seed-source/chaptersdata2.json",
      ];
      type ChapterSeed = z.infer<typeof ChapterSeedSchema>;
      const allRawChapters: ChapterSeed[] = [];
      for (const file of chapterFiles) {
        const filePath = path.resolve(file);
        try {
          if (
            await fs.stat(filePath).then(
              () => true,
              () => false
            )
          ) {
            const data = JSON.parse(await fs.readFile(filePath, "utf8"));
            if (Array.isArray(data)) {
              // Transform chapter data to match ChapterSeedSchema
              let idCounter = allRawChapters.length + 1;
              for (const raw of data) {
                // Try to infer comicId by matching comicslug to comics table
                let comicId: number | undefined = undefined;
                if (raw.comicslug && Array.isArray(allRawComics)) {
                  const found = allRawComics.find((c) => c.slug === raw.comicslug);
                  if (found && found.id) comicId = found.id;
                }
                // Map fields
                const chapter: ChapterSeed = {
                  id: idCounter++,
                  comicId: comicId ?? 0, // fallback to 0 if not found
                  title: raw.chaptername || raw.title || "",
                  slug: raw.chapterslug || raw.slug || "",
                  images: Array.isArray(raw.image_urls) ? raw.image_urls : [],
                  releaseDate: raw.updated_at || raw.releaseDate || undefined,
                };
                allRawChapters.push(chapter);
              }
            }
          }
        } catch (err: unknown) {
          log("error", {
            phase: "chapters",
            file,
            error: err instanceof Error ? (err as Error).message : err,
          });
        }
      }
      // Filter out chapters missing required fields before validation
      const requiredFields = ["id", "comicId", "title", "slug", "images"];
      const validChapters = allRawChapters.filter((c: ChapterSeed) =>
        requiredFields.every((f: string) =>
          f === "images"
            ? Array.isArray(c.images) && c.images.length > 0
            : (c as Record<string, unknown>)[f] !== undefined &&
              (c as Record<string, unknown>)[f] !== null &&
              (c as Record<string, unknown>)[f] !== ""
        )
      );
      const skippedChapters = allRawChapters.filter((c: ChapterSeed) => !validChapters.includes(c));
      if (skippedChapters.length > 0) {
        log("warning", {
          phase: "chapters-filter",
          skippedCount: skippedChapters.length,
          sample: skippedChapters.slice(0, 10).map((c: ChapterSeed) => ({
            id: c.id,
            comicId: c.comicId,
            title: c.title,
            slug: c.slug,
            images: c.images,
          })),
          message: "Some chapters were missing required fields and were skipped.",
        });
      }
      // Debug: print a sample of chapters before validation
      log("pre-validate", {
        phase: "chapters",
        count: validChapters.length,
        sample: validChapters.slice(0, 10).map((c: ChapterSeed) => ({
          id: c.id,
          comicId: c.comicId,
          title: c.title,
          slug: c.slug,
          images: Array.isArray(c.images) ? c.images.length : c.images,
        })),
      });
      let chapters: ChapterSeed[] = [];
      try {
        chapters = ChapterSeedSchema.array().parse(validChapters);
      } catch (err: unknown) {
        log("error", {
          phase: "chapters-validate",
          error: err instanceof Error ? (err as Error).message : err,
        });
        throw err;
      }
      // Debug: print a sample of chapters after validation
      log("pre-insert", {
        phase: "chapters",
        count: chapters.length,
        sample: chapters.slice(0, 10).map((c: ChapterSeed) => ({
          id: c.id,
          comicId: c.comicId,
          title: c.title,
          slug: c.slug,
          images: Array.isArray(c.images) ? c.images.length : c.images,
        })),
      });
      log("progress", { phase: "chapters", count: chapters.length });
      // Download chapter images in parallel (skip in dry-run mode)
      if (!dryRun) {
        await Promise.all(
          chapters.map(async (chapter: ChapterSeed) => {
            if (Array.isArray(chapter.images)) {
              try {
                chapter.images = await Promise.all(
                  chapter.images.map((imgUrl: string) =>
                    downloadAndSaveImage({
                      url: imgUrl,
                      destDir:
                        config.CHAPTERS_IMAGE_DIR + "/" + chapter.comicId + "/" + chapter.slug,
                      filename: path.basename(imgUrl),
                      fallback: config.PLACEHOLDER_COMIC,
                    })
                  )
                );
              } catch (err: unknown) {
                log("error", {
                  phase: "chapter-image",
                  slug: chapter.slug,
                  error: err instanceof Error ? (err as Error).message : err,
                });
              }
            }
          })
        );
      } else {
        log("progress", { phase: "chapters", message: "Skipping image downloads (dry-run)" });
      }
      await seedTableBatched({
        table: chapter,
        items: chapters,
        conflictKeys: [chapter.id],
        updateFields: [
          { name: "title", value: undefined },
          { name: "slug", value: undefined },
          { name: "images", value: undefined },
          { name: "releaseDate", value: undefined },
        ],
        dryRun,
      });
      log("complete", { phase: "chapters", transaction: true });
    });

    log("complete", { phase: "seeding" });
  } catch (err: unknown) {
    log("error", { phase: "seeding", error: err instanceof Error ? (err as Error).message : err });
    throw err;
  }
}

export default main;
