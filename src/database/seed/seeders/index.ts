/**
 * @file index.ts
 * @description Entity seeders barrel export
 */

// Metadata seeders
export { type ArtistSeederOptions, type ArtistSeederResult, seedArtists } from "./artist-seeder";
export { type AuthorSeederOptions, type AuthorSeederResult, seedAuthors } from "./author-seeder";
export { type GenreSeederOptions, type GenreSeederResult, seedGenres } from "./genre-seeder";
export { seedTypes, type TypeSeederOptions, type TypeSeederResult } from "./type-seeder";

// Core entity seeders
export { type ChapterSeederOptions, type ChapterSeederResult, seedChapters } from "./chapter-seeder";
export { type ComicSeederOptions, type ComicSeederResult, seedComics } from "./comic-seeder";
export { seedUsers, type UserSeederOptions, type UserSeederResult } from "./user-seeder";

// RBAC seeder
export { type SeedResult as RolePermissionSeederResult, seedRolesAndPermissions } from "./role-permission-seeder";

// Common seeder result type
export interface SeederResult {
  errors: Array<{ error: string; item?: unknown }>;
  seeded: number;
  skipped: number;
  success: boolean;
}
