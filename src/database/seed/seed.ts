import { db } from '@/database/db';
import { author, artist, type as typeTable, genre, comic, chapter } from '@/database/schema';
import { batchInsert, generateSeedReport } from './helpers';
import type { SeedReport } from './helpers';

/**
 * Generate mock seed data
 */
function generateAuthors(count: number = 10) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Author ${i + 1}`,
    bio: `A talented comic author with many years of experience.`,
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=author${i + 1}`,
  }));
}

function generateArtists(count: number = 10) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Artist ${i + 1}`,
    bio: `A skilled artist specializing in comic illustrations.`,
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=artist${i + 1}`,
  }));
}

function generateTypes(count: number = 5) {
  const types = ['Manga', 'Webtoon', 'Comic', 'Manhua', 'Manhwa'];
  return types.slice(0, count).map((name) => ({
    name,
    description: `${name} style comics`,
  }));
}

function generateGenres(count: number = 12) {
  const genres = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Fantasy',
    'Horror',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Slice of Life',
    'Thriller',
    'Supernatural',
  ];
  return genres.slice(0, count).map((name) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description: `${name} genre comics`,
  }));
}

function generateComics(authorIds: number[], artistIds: number[], typeIds: number[], count: number = 20) {
  const statuses = ['Ongoing', 'Completed', 'Hiatus', 'Dropped', 'Coming Soon'];
  const titles = [
    'Dragon Quest',
    'Sky Chronicle',
    'Hidden Realm',
    'Mystic Hearts',
    'Battle Academy',
    'Soul Seekers',
    'Last Guardian',
    'Eternal Night',
    'Crimson Path',
    'Silver Moon',
  ];

  return Array.from({ length: count }, (_, i) => ({
    title: titles[i % titles.length] + ` ${Math.floor(i / titles.length) + 1}`,
    slug: (titles[i % titles.length] + `-${Math.floor(i / titles.length) + 1}`)
      .toLowerCase()
      .replace(/\s+/g, '-'),
    description: `An exciting comic series with action, adventure, and intense moments.`,
    coverImage: `https://picsum.photos/400/600?random=${i}`,
    status: statuses[i % statuses.length],
    publicationDate: new Date(2024, Math.floor(i / 2), (i % 28) + 1),
    views: Math.floor(Math.random() * 100000),
    rating: Math.floor(Math.random() * 50) / 10,
    authorId: authorIds[i % authorIds.length],
    artistId: artistIds[i % artistIds.length],
    typeId: typeIds[i % typeIds.length],
  }));
}

function generateChapters(comicIds: number[], chaptersPerComic: number = 5) {
  const chapters = [];
  for (const comicId of comicIds) {
    for (let i = 1; i <= chaptersPerComic; i++) {
      chapters.push({
        slug: `comic-${comicId}-chapter-${i}`,
        title: `Chapter ${i}`,
        chapterNumber: i,
        releaseDate: new Date(2024, Math.floor(Math.random() * 12), (Math.random() * 28) + 1),
        comicId,
        views: Math.floor(Math.random() * 50000),
        url: null,
        content: `Episode ${i} content goes here...`,
      });
    }
  }
  return chapters;
}

/**
 * Execute seeding
 */
export async function seed() {
  const reports: SeedReport[] = [];

  try {
    // Authors
    console.log('Seeding authors...');
    const authorData = generateAuthors(10);
    const authorResult = await batchInsert(author, authorData);
    reports.push({
      table: 'author',
      records: authorResult.count,
      status: authorResult.success ? 'success' : 'failed',
      error: authorResult.error,
    });

    // Artists
    console.log('Seeding artists...');
    const artistData = generateArtists(10);
    const artistResult = await batchInsert(artist, artistData);
    reports.push({
      table: 'artist',
      records: artistResult.count,
      status: artistResult.success ? 'success' : 'failed',
      error: artistResult.error,
    });

    // Types
    console.log('Seeding types...');
    const typeData = generateTypes(5);
    const typeResult = await batchInsert(typeTable, typeData);
    reports.push({
      table: 'type',
      records: typeResult.count,
      status: typeResult.success ? 'success' : 'failed',
      error: typeResult.error,
    });

    // Genres
    console.log('Seeding genres...');
    const genreData = generateGenres(12);
    const genreResult = await batchInsert(genre, genreData);
    reports.push({
      table: 'genre',
      records: genreResult.count,
      status: genreResult.success ? 'success' : 'failed',
      error: genreResult.error,
    });

    // Get IDs for relationships
    const authorIds = Array.from({ length: 10 }, (_, i) => i + 1);
    const artistIds = Array.from({ length: 10 }, (_, i) => i + 1);
    const typeIds = Array.from({ length: 5 }, (_, i) => i + 1);

    // Comics
    console.log('Seeding comics...');
    const comicData = generateComics(authorIds, artistIds, typeIds, 20);
    const comicResult = await batchInsert(comic, comicData);
    reports.push({
      table: 'comic',
      records: comicResult.count,
      status: comicResult.success ? 'success' : 'failed',
      error: comicResult.error,
    });

    // Chapters
    console.log('Seeding chapters...');
    const comicIds = Array.from({ length: 20 }, (_, i) => i + 1);
    const chapterData = generateChapters(comicIds, 5);
    const chapterResult = await batchInsert(chapter, chapterData);
    reports.push({
      table: 'chapter',
      records: chapterResult.count,
      status: chapterResult.success ? 'success' : 'failed',
      error: chapterResult.error,
    });

    return {
      success: true,
      reports,
      report: generateSeedReport(reports),
    };
  } catch (error) {
    console.error('Seed error:', error);
    return {
      success: false,
      reports,
      error: String(error),
    };
  }
}
