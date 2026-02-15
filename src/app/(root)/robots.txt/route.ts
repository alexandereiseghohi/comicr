import { NextResponse } from "next/server";

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dev/
Disallow: /_next/
Disallow: /private/
Disallow: /user/
Disallow: /auth/
Disallow: /profile/
Disallow: /bookmarks/

# Sitemap location
Sitemap: ${process.env.NEXT_PUBLIC_API_URL || "https://comicwise.com"}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1

# Allow access to public images
Allow: /images/
Allow: /icons/
Allow: /covers/

# Block access to sensitive files
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /*_buildManifest.js$
Disallow: /*_ssgManifest.js$

# Allow social media bots
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

# Block known bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
}
