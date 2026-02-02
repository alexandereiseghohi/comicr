#!/usr/bin/env tsx
/**
 * enhance-seo.ts - SEO Enhancement Implementation
 * Implements comprehensive SEO optimizations including metadata,
 * structured data, sitemaps, and Core Web Vitals improvements
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

// Color utilities
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

// SEO metadata utilities
const SEO_METADATA = `import type { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  image?: string;
  type?: 'website' | 'article' | 'book' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export class SEOGenerator {
  private baseUrl: string;
  private siteName: string;
  private defaultImage: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://comicwise.com';
    this.siteName = 'ComicWise';
    this.defaultImage = '/images/og-default.png';
  }

  generate(config: SEOConfig): Metadata {
    const {
      title,
      description,
      keywords,
      canonical,
      noindex,
      nofollow,
      image,
      type = 'website',
      publishedTime,
      modifiedTime,
      author,
      section,
      tags,
    } = config;

    const fullTitle = title.includes(this.siteName) ? title : \`\${title} | \${this.siteName}\`;
    const imageUrl = image ? \`\${this.baseUrl}\${image}\` : \`\${this.baseUrl}\${this.defaultImage}\`;
    const canonicalUrl = canonical || \`\${this.baseUrl}\`;

    const metadata: Metadata = {
      title: fullTitle,
      description,
      keywords: keywords?.join(', '),

      // Basic meta tags
      metadataBase: new URL(this.baseUrl),
      alternates: {
        canonical: canonicalUrl,
      },

      // Robots
      robots: {
        index: !noindex,
        follow: !nofollow,
        googleBot: {
          index: !noindex,
          follow: !nofollow,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },

      // Open Graph
      openGraph: {
        type,
        title: fullTitle,
        description,
        url: canonicalUrl,
        siteName: this.siteName,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: 'en_US',
        ...(publishedTime && { publishedTime }),
        ...(modifiedTime && { modifiedTime }),
        ...(type === 'article' && {
          authors: author ? [author] : undefined,
          section,
          tags,
        }),
      },

      // Twitter/X
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description,
        images: [imageUrl],
        creator: '@comicwise',
        site: '@comicwise',
      },

      // Additional meta tags
      other: {
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'apple-mobile-web-app-title': this.siteName,
        'application-name': this.siteName,
        'mobile-web-app-capable': 'yes',
        'msapplication-TileColor': '#000000',
        'theme-color': '#000000',
      },
    };

    return metadata;
  }

  // Generate JSON-LD structured data
  generateJsonLd(config: any) {
    const baseStructured = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.siteName,
      url: this.baseUrl,
      description: 'Discover and read amazing comics online',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: \`\${this.baseUrl}/search?q={search_term_string}\`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    switch (config.type) {
      case 'comic':
        return this.generateComicJsonLd(config);
      case 'chapter':
        return this.generateChapterJsonLd(config);
      case 'author':
        return this.generateAuthorJsonLd(config);
      default:
        return baseStructured;
    }
  }

  private generateComicJsonLd(comic: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: comic.title,
      description: comic.description,
      image: comic.coverUrl,
      author: {
        '@type': 'Person',
        name: comic.author,
      },
      genre: comic.genres,
      datePublished: comic.publishDate,
      aggregateRating: comic.rating && {
        '@type': 'AggregateRating',
        ratingValue: comic.rating.average,
        reviewCount: comic.rating.count,
        bestRating: 5,
        worstRating: 1,
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        url: this.baseUrl,
      },
    };
  }

  private generateChapterJsonLd(chapter: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: chapter.title,
      description: \`Chapter \${chapter.number} of \${chapter.comicTitle}\`,
      isPartOf: {
        '@type': 'Book',
        name: chapter.comicTitle,
      },
      position: chapter.number,
      datePublished: chapter.releaseDate,
      author: {
        '@type': 'Person',
        name: chapter.author,
      },
    };
  }

  private generateAuthorJsonLd(author: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: author.name,
      description: author.bio,
      image: author.avatarUrl,
      sameAs: author.socialLinks,
      knowsAbout: author.genres,
    };
  }
}

export const seoGenerator = new SEOGenerator();

// Pre-defined SEO configs for common pages
export const seoConfigs = {
  home: {
    title: 'ComicWise - Discover Amazing Comics Online',
    description: 'Explore thousands of comics, manhwa, manga, and webtoons. Read, rate, and discover your next favorite story on ComicWise.',
    keywords: ['comics', 'manga', 'manhwa', 'webtoons', 'online reading', 'comic reader'],
    type: 'website' as const,
  },

  browse: {
    title: 'Browse Comics - Discover Your Next Favorite Story',
    description: 'Browse our extensive collection of comics by genre, author, or popularity. Find your next great read.',
    keywords: ['browse comics', 'comic genres', 'popular comics', 'new releases'],
    type: 'website' as const,
  },

  search: (query: string) => ({
    title: \`Search Results for "\${query}" - ComicWise\`,
    description: \`Find comics, authors, and genres related to "\${query}". Discover new stories on ComicWise.\`,
    keywords: ['search', 'find comics', query],
    type: 'website' as const,
    noindex: !query || query.length < 3, // Don't index empty or very short searches
  }),

  comic: (comic: any) => ({
    title: comic.title,
    description: comic.description || \`Read \${comic.title} online. \${comic.genres?.join(', ') || 'Comic'} by \${comic.author}.\`,
    keywords: [comic.title, comic.author, ...(comic.genres || []), 'comic', 'read online'],
    type: 'book' as const,
    image: comic.coverUrl,
    author: comic.author,
    tags: comic.genres,
  }),

  chapter: (chapter: any, comic: any) => ({
    title: \`\${chapter.title} - \${comic.title}\`,
    description: \`Read \${chapter.title} of \${comic.title} online. Chapter \${chapter.number} by \${comic.author}.\`,
    keywords: [comic.title, chapter.title, comic.author, 'chapter', 'read online'],
    type: 'article' as const,
    image: comic.coverUrl,
    author: comic.author,
    section: 'Comics',
    publishedTime: chapter.releaseDate,
  }),

  profile: (user: any) => ({
    title: \`\${user.name} - Reader Profile\`,
    description: \`View \${user.name}'s reading list, reviews, and favorite comics on ComicWise.\`,
    keywords: ['user profile', 'reading list', 'comic reviews'],
    type: 'profile' as const,
    image: user.avatarUrl,
    noindex: true, // User profiles should not be indexed
  }),
};`;

// Sitemap generation utilities
const SITEMAP_GENERATOR = `import { db } from '@/database/db';
import { comic, chapter, author, genre } from '@/database/schema';
import { desc, eq, isNotNull, View } from 'drizzle-orm';
import image from "next/image";

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://comicwise.com';
  }

  async generateStaticSitemap(): Promise<SitemapEntry[]> {
    const staticPages = [
      {
        url: this.baseUrl,
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: \`\${this.baseUrl}/browse\`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      {
        url: \`\${this.baseUrl}/genres\`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: \`\${this.baseUrl}/authors\`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: \`\${this.baseUrl}/about\`,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: \`\${this.baseUrl}/contact\`,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: \`\${this.baseUrl}/privacy\`,
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: \`\${this.baseUrl}/terms\`,
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
    ];

    return staticPages.map(page => ({
      ...page,
      lastModified: new Date(),
    }));
  }

  async generateComicsSitemap(): Promise<SitemapEntry[]> {
    try {
      const comics = await db
        .select({
          slug: comic.slug,
          updatedAt: comic.updatedAt,
          isActive: comic.isActive,
        })
        .from(comic)
        .where(eq(comic.isActive, true))
        .orderBy(desc(comic.updatedAt));

      return comics.map(c => ({
        url: \`\${this.baseUrl}/comic/\${c.slug}\`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    } catch (error) {
      console.error('Failed to generate comics sitemap:', error);
      return [];
    }
  }

  async generateChaptersSitemap(): Promise<SitemapEntry[]> {
    try {
      const chapters = await db
        .select({
          comicSlug: comic.slug,
          chapterSlug: chapter.slug,
          releaseDate: chapter.releaseDate,
        })
        .from(chapter)
        .innerJoin(comic, eq(chapter.comicId, comic.id))
        .where(eq(comic.isActive, true))
        .orderBy(desc(chapter.releaseDate));

      return chapters.map(c => ({
        url: \`\${this.baseUrl}/comic/\${c.comicSlug}/\${c.chapterSlug}\`,
        lastModified: c.releaseDate,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } catch (error) {
      console.error('Failed to generate chapters sitemap:', error);
      return [];
    }
  }

  async generateAuthorsSitemap(): Promise<SitemapEntry[]> {
    try {
      const authors = await db
        .select({
          slug: author.slug,
          updatedAt: author.updatedAt,
        })
        .from(author)
        .where(isNotNull(author.slug));

      return authors.map(a => ({
        url: \`\${this.baseUrl}/author/\${a.slug}\`,
        lastModified: a.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }));
    } catch (error) {
      console.error('Failed to generate authors sitemap:', error);
      return [];
    }
  }

  async generateGenresSitemap(): Promise<SitemapEntry[]> {
    try {
      const genres = await db
        .select({
          slug: genre.slug,
          updatedAt: genre.updatedAt,
        })
        .from(genre);

      return genres.map(g => ({
        url: \`\${this.baseUrl}/genre/\${g.slug}\`,
        lastModified: g.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } catch (error) {
      console.error('Failed to generate genres sitemap:', error);
      return [];
    }
  }

  async generateFullSitemap(): Promise<SitemapEntry[]> {
    const [staticPages, comicsPages, chaptersPages, authorsPages, genresPages] = await Promise.all([
      this.generateStaticSitemap(),
      this.generateComicsSitemap(),
      this.generateChaptersSitemap(),
      this.generateAuthorsSitemap(),
      this.generateGenresSitemap(),
    ]);

    return [
      ...staticPages,
      ...comicsPages,
      ...chaptersPages,
      ...authorsPages,
      ...genresPages,
    ];
  }

  // Generate XML sitemap format
  generateXML(entries: SitemapEntry[]): string {
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries.map(entry => {
        const lastMod = entry.lastModified
          ? \`<lastmod>\${entry.lastModified.toISOString()}</lastmod>\`
          : '';
        const changeFreq = entry.changeFrequency
          ? \`<changefreq>\${entry.changeFrequency}</changefreq>\`
          : '';
        const priority = entry.priority
          ? \`<priority>\${entry.priority}</priority>\`
          : '';

        return [
          '  <url>',
          \`    <loc>\${entry.url}</loc>\`,
          \`    \${lastMod}\`,
          \`    \${changeFreq}\`,
          \`    \${priority}\`,
          '  </url>',
        ].join('\\n');
      }),
      '</urlset>',
    ].join('\\n');

    return xml;
  }
}

export const sitemapGenerator = new SitemapGenerator();`;

// robots.txt generation
const ROBOTS_GENERATOR = `export function generateRobots(): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://comicwise.com';

  return \`User-agent: *
Allow: /

# Disallow admin and private pages
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /auth/
Disallow: /profile/settings
Disallow: /search?q=

# Allow specific API endpoints for SEO
Allow: /api/og/

# Crawl delay for better performance
Crawl-delay: 1

# Sitemap location
Sitemap: \${baseUrl}/sitemap.xml
Sitemap: \${baseUrl}/sitemap-comics.xml
Sitemap: \${baseUrl}/sitemap-chapters.xml
Sitemap: \${baseUrl}/sitemap-authors.xml
Sitemap: \${baseUrl}/sitemap-genres.xml

# Archive.org
User-agent: ia_archiver
Allow: /

# Additional search engines
User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /
\`;
}`;

// SEO page templates
const SEO_PAGE_TEMPLATES = `import { Metadata } from 'next';
import { seoGenerator, seoConfigs } from '@/lib/seo/metadata';

// Home page SEO
export function generateHomeMetadata(): Metadata {
  return seoGenerator.generate(seoConfigs.home);
}

// Comic page SEO
export function generateComicMetadata(comic: any): Metadata {
  return seoGenerator.generate(seoConfigs.comic(comic));
}

// Chapter page SEO
export function generateChapterMetadata(chapter: any, comic: any): Metadata {
  return seoGenerator.generate(seoConfigs.chapter(chapter, comic));
}

// Search page SEO
export function generateSearchMetadata(query: string): Metadata {
  return seoGenerator.generate(seoConfigs.search(query));
}

// Browse page SEO
export function generateBrowseMetadata(): Metadata {
  return seoGenerator.generate(seoConfigs.browse);
}

// Generic page SEO helper
export function generatePageMetadata(config: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  return seoGenerator.generate({
    ...config,
    canonical: \`\${process.env.NEXT_PUBLIC_SITE_URL}\${config.path}\`,
  });
}`;

async function enhanceSEO() {
  log.info("🔍 Setting up comprehensive SEO enhancements...");

  try {
    // Create SEO utilities directory
    const seoDir = path.join(process.cwd(), "src", "lib", "seo");
    await fs.mkdir(seoDir, { recursive: true });

    // Create metadata utilities
    log.info("Creating SEO metadata utilities...");
    const metadataPath = path.join(seoDir, "metadata.ts");
    await fs.writeFile(metadataPath, SEO_METADATA);
    log.success("✓ Created metadata utilities");

    // Create sitemap generator
    log.info("Creating sitemap generator...");
    const sitemapPath = path.join(seoDir, "sitemap.ts");
    await fs.writeFile(sitemapPath, SITEMAP_GENERATOR);
    log.success("✓ Created sitemap generator");

    // Create robots.txt generator
    log.info("Creating robots.txt generator...");
    const robotsPath = path.join(seoDir, "robots.ts");
    await fs.writeFile(robotsPath, ROBOTS_GENERATOR);
    log.success("✓ Created robots.txt generator");

    // Create page templates
    log.info("Creating SEO page templates...");
    const templatesPath = path.join(seoDir, "templates.ts");
    await fs.writeFile(templatesPath, SEO_PAGE_TEMPLATES);
    log.success("✓ Created SEO templates");

    // Create SEO index
    const indexContent = `export * from './metadata';
export * from './sitemap';
export * from './robots';
export * from './templates';

// Re-export commonly used items
export { seoGenerator, seoConfigs } from './metadata';
export { sitemapGenerator } from './sitemap';
export { generateRobots } from './robots';
`;
    const indexPath = path.join(seoDir, "index.ts");
    await fs.writeFile(indexPath, indexContent);
    log.success("✓ Created SEO index");

    // Create sitemap API routes directory
    const appDir = path.join(process.cwd(), "src", "app");
    const sitemapApiDir = path.join(appDir, "sitemap.xml");
    await fs.mkdir(sitemapApiDir, { recursive: true });

    // Create main sitemap route
    const mainSitemapRoute = `import { sitemapGenerator } from '@/lib/seo';

export async function GET() {
  try {
    const entries = await sitemapGenerator.generateFullSitemap();
    const xml = sitemapGenerator.generateXML(entries);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}`;
    await fs.writeFile(path.join(sitemapApiDir, "route.ts"), mainSitemapRoute);
    log.success("✓ Created main sitemap route");

    // Create robots.txt route
    const robotsApiDir = path.join(appDir, "robots.txt");
    await fs.mkdir(robotsApiDir, { recursive: true });

    const robotsRoute = `import { generateRobots } from '@/lib/seo';

export async function GET() {
  const robots = generateRobots();

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}`;
    await fs.writeFile(path.join(robotsApiDir, "route.ts"), robotsRoute);
    log.success("✓ Created robots.txt route");

    // Create specialized sitemap routes
    const specializedSitemaps = [
      { name: "comics", method: "generateComicsSitemap" },
      { name: "chapters", method: "generateChaptersSitemap" },
      { name: "authors", method: "generateAuthorsSitemap" },
      { name: "genres", method: "generateGenresSitemap" },
    ];

    for (const sitemap of specializedSitemaps) {
      const sitemapDir = path.join(appDir, `sitemap-${sitemap.name}.xml`);
      await fs.mkdir(sitemapDir, { recursive: true });

      const sitemapRoute = `import { sitemapGenerator } from '@/lib/seo';

export async function GET() {
  try {
    const entries = await sitemapGenerator.${sitemap.method}();
    const xml = sitemapGenerator.generateXML(entries);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('${sitemap.name} sitemap generation failed:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}`;
      await fs.writeFile(path.join(sitemapDir, "route.ts"), sitemapRoute);
      log.success(`✓ Created ${sitemap.name} sitemap route`);
    }

    log.success("🎉 SEO enhancements setup completed successfully!");
    log.info("Available features:");
    log.info("  • Metadata Generator - Comprehensive meta tags and Open Graph");
    log.info("  • Sitemap Generator - Dynamic XML sitemaps for all content");
    log.info("  • Robots.txt - SEO-friendly crawler directives");
    log.info("  • JSON-LD - Structured data for rich snippets");
    log.info("  • Page Templates - Pre-configured SEO for common pages");
  } catch (error) {
    log.error(`SEO enhancement setup failed: ${error}`);
    throw error;
  }
}

// Execute when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  enhanceSEO().catch(console.error);
}

export default enhanceSEO;
