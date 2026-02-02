import { NextResponse } from "next/server";

import * as queries from "@/database/queries/comic-queries";

export async function GET() {
  try {
    // Get all comics for sitemap
    const comics = await queries.getAllComics({
      page: 1,
      limit: 10000, // Get all comics
      // Note: Filtering by status would need a separate function
    });

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${process.env.NEXT_PUBLIC_API_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${process.env.NEXT_PUBLIC_API_URL}/comics</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${process.env.NEXT_PUBLIC_API_URL}/genres</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${process.env.NEXT_PUBLIC_API_URL}/authors</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${process.env.NEXT_PUBLIC_API_URL}/search</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
${
  comics.success && comics.data
    ? comics.data
        .map(
          (comic: any) => `  <url>
    <loc>${process.env.NEXT_PUBLIC_API_URL}/comics/${comic.slug}</loc>
    <lastmod>${
      comic.updatedAt?.toISOString() || comic.createdAt?.toISOString() || new Date().toISOString()
    }</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    ${
      comic.coverImage
        ? `<image:image>
      <image:loc>${comic.coverImage}</image:loc>
      <image:caption>${comic.title}</image:caption>
      <image:title>${comic.title}</image:title>
    </image:image>`
        : ""
    }
  </url>`
        )
        .join("\n")
    : ""
}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Failed to generate sitemap:", error);

    // Return minimal sitemap on error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.NEXT_PUBLIC_API_URL || "https://comicwise.com"}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes on error
      },
    });
  }
}
