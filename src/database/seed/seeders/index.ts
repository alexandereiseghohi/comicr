/**
 * @file index.ts
 * @description Entity seeders barrel export
 */

// Metadata seeders
export { seedArtists, type ArtistSeederOptions, type ArtistSeederResult } from "./artist-seeder";
export { seedAuthors, type AuthorSeederOptions, type AuthorSeederResult } from "./author-seeder";
export { seedGenres, type GenreSeederOptions, type GenreSeederResult } from "./genre-seeder";
export { seedTypes, type TypeSeederOptions, type TypeSeederResult } from "./type-seeder";

// Core entity seeders
export { seedChapters, type ChapterSeederOptions, type ChapterSeederResult } from "./chapter-seeder";
export { seedComics } from "./comic-seeder";
export { seedUsers, type UserSeederOptions, type UserSeederResult } from "./user-seeder";

// RBAC seeder
export { seedRolesAndPermissions, type SeedResult as RolePermissionSeederResult } from "./role-permission-seeder";

// Common seeder result type
export interface SeederResult {
  errors: Array<{ error: string; item?: unknown }>;
  seeded: number;
  skipped: number;
  success: boolean;
}
