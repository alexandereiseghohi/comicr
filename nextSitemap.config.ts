/**
 * @file nextSitemap.config.ts
 * @description Sitemap and robots.txt configuration for ComicWise
 * @author ComicWise Team
 * @date 2026-01-30
 */

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  generateRobotsTxt: true,
  exclude: ["/admin/*", "/api/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin", "/api"] },
    ],
    additionalSitemaps: [`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/server-sitemap.xml`],
  },
};
