/**
 * @file nextSitemap.config.ts
 * @description Sitemap and robots.txt configuration for ComicWise
 * @author ComicWise Team
 * @updated 2026-02-01
 */

const siteUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const config = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: true,

  // ========== ROUTE HANDLING ==========
  exclude: [
    // Admin routes
    "/admin/*",
    "/admin",
    // API routes
    "/api/*",
    "/api",
    // Auth routes (handled by server-sitemap)
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-request",
    "/error",
    // Dev routes
    "/dev/*",
  ],

  // ========== PRIORITY & FREQUENCY ==========
  priority: 0.7, // Default priority
  changefreq: "weekly",

  // Transform function for dynamic priorities
  transform: async (_config: unknown, path: string) => {
    // Homepage - highest priority
    if (path === "/") {
      return {
        loc: path,
        changefreq: "daily",
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    // Comics listing and browse pages - high priority
    if (path === "/comics" || path === "/browse" || path === "/genres") {
      return {
        loc: path,
        changefreq: "daily",
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    // Individual comic pages - medium-high priority
    if (path.match(/^\/comics\/[^/]+$/)) {
      return {
        loc: path,
        changefreq: "daily",
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    // Chapter pages - medium priority (frequent updates)
    if (path.match(/^\/comics\/[^/]+\/\d+$/)) {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 0.6,
        lastmod: new Date().toISOString(),
      };
    }

    // Static pages - low priority
    return {
      loc: path,
      changefreq: "monthly",
      priority: 0.5,
      lastmod: new Date().toISOString(),
    };
  },

  // ========== ROBOTS.TXT ==========
  robotsTxtOptions: {
    policies: [
      // Allow all crawlers on public pages
      { userAgent: "*", allow: "/" },
      // Block admin and API
      { userAgent: "*", disallow: ["/admin", "/api", "/dev"] },
      // Block specific crawlers from authenticated pages
      { userAgent: "*", disallow: ["/profile", "/bookmarks"] },
    ],
    additionalSitemaps: [
      // Server-generated sitemap for dynamic content
      `${siteUrl}/server-sitemap.xml`,
    ],
  },
};

export default config;
