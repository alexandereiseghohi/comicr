import type { Comic } from "@/types";
import type { Metadata } from "next";


export interface SEOConfig {
  defaultImage: string;
  keywords: string[];
  locale: string;
  siteDescription: string;
  siteName: string;
  siteUrl: string;
  twitterHandle: string;
}

export const seoConfig: SEOConfig = {
  siteName: "ComicWise",
  siteDescription:
    "Discover, read, and enjoy the best comics online. Your gateway to amazing stories and artwork.",
  siteUrl: process.env.NEXT_PUBLIC_API_URL || "https://comicwise.com",
  defaultImage: "/images/og-default.jpg",
  twitterHandle: "@comicwise",
  locale: "en_US",
  keywords: [
    "comics",
    "manga",
    "webcomics",
    "graphic novels",
    "online reading",
    "comic books",
    "digital comics",
    "comic platform",
  ],
};

export function generateMetadata(options: {
  author?: string;
  description?: string;
  image?: string;
  keywords?: string[];
  modifiedTime?: string;
  noIndex?: boolean;
  publishedTime?: string;
  title?: string;
  type?: "article" | "website";
  url?: string;
}): Metadata {
  const {
    title,
    description = seoConfig.siteDescription,
    image = seoConfig.defaultImage,
    url = seoConfig.siteUrl,
    keywords = seoConfig.keywords,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    noIndex = false,
  } = options;

  const fullTitle = title ? `${title} | ${seoConfig.siteName}` : seoConfig.siteName;
  const fullUrl = url.startsWith("http") ? url : `${seoConfig.siteUrl}${url}`;
  const fullImage = image.startsWith("http") ? image : `${seoConfig.siteUrl}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: author ? [{ name: author }] : undefined,
    robots: noIndex ? "noindex,nofollow" : "index,follow",
    openGraph: {
      type,
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: seoConfig.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title || seoConfig.siteName,
        },
      ],
      locale: seoConfig.locale,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [fullImage],
      creator: seoConfig.twitterHandle,
      site: seoConfig.twitterHandle,
    },
    alternates: {
      canonical: fullUrl,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export function generateComicMetadata(comic: Comic): Metadata {
  const keywords = [
    ...seoConfig.keywords,
    comic.title,
    // TODO: Add genres relationship data
    // ...(comic.genres?.map((g) => g.name) || []),
    // comic.author?.name || "", // TODO: Add author relationship
    "comic",
    "read online",
  ].filter(Boolean);

  return generateMetadata({
    title: comic.title,
    description:
      comic.description && comic.description.length > 155
        ? `${comic.description.substring(0, 152)}...`
        : comic.description || "Read this amazing comic online",
    image: comic.coverImage || seoConfig.defaultImage,
    url: `/comics/${comic.slug}`,
    keywords,
    type: "article",
    publishedTime: comic.createdAt?.toISOString(),
    modifiedTime: comic.updatedAt?.toISOString(),
    // TODO: Add author name via relationship lookup
    // author: comic.author?.name,
  });
}

export function generateChapterMetadata(
  comic: Comic,
  chapter: { createdAt?: Date; imageUrl?: string; number: number; title?: string; updatedAt?: Date }
): Metadata {
  const title = `${comic.title} - Chapter ${chapter.number}${
    chapter.title ? `: ${chapter.title}` : ""
  }`;
  const description = `Read ${comic.title} Chapter ${chapter.number} online. ${
    comic.description || ""
  }`;

  return generateMetadata({
    title,
    description: description.length > 155 ? `${description.substring(0, 152)}...` : description,
    image: chapter.imageUrl || comic.coverImage || seoConfig.defaultImage,
    url: `/comics/${comic.slug}/chapter/${chapter.number}`,
    type: "article",
    publishedTime: chapter.createdAt?.toISOString(),
    modifiedTime: chapter.updatedAt?.toISOString(),
    // TODO: Add author name via relationship lookup
    // author: comic.author?.name,
    keywords: [
      ...seoConfig.keywords,
      comic.title,
      `chapter ${chapter.number}`,
      // TODO: Add genres relationship data
      // ...(comic.genres?.map((g) => g.name) || []),
      "read online",
      "free comic",
    ],
  });
}

export function generateStructuredData(comic: Comic) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: comic.title,
    description: comic.description,
    image: comic.coverImage,
    // TODO: Add author name via relationship lookup
    // author: {
    //   "@type": "Person",
    //   name: comic.author?.name,
    // },
    publisher: {
      "@type": "Organization",
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
    },
    // TODO: Add genres relationship data
    // genre: comic.genres?.map((g) => g.name),
    inLanguage: "en",
    aggregateRating: comic.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: comic.rating,
          ratingCount: 1, // TODO: Add actual rating count
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    url: `${seoConfig.siteUrl}/comics/${comic.slug}`,
    datePublished: comic.createdAt?.toISOString(),
    dateModified: comic.updatedAt?.toISOString(),
  };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        "@id": item.url ? `${seoConfig.siteUrl}${item.url}` : undefined,
        name: item.name,
      },
    })),
  };
}

export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seoConfig.siteName,
    description: seoConfig.siteDescription,
    url: seoConfig.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${seoConfig.siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${seoConfig.siteUrl}/images/logo.png`,
        width: 512,
        height: 512,
      },
    },
  };
}

export const seoUtils = {
  generateMetadata,
  generateComicMetadata,
  generateChapterMetadata,
  generateStructuredData,
  generateBreadcrumbStructuredData,
  generateWebsiteStructuredData,
  seoConfig,
};

export default seoUtils;
