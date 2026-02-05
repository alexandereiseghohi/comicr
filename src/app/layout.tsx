import type { Metadata, Viewport } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import Footer from "@/components/navigation/footer";
import Header from "@/components/navigation/header";

import "@/styles/globals.css";
import localFont from "next/font/local";

import Providers from "./providers";
// Primary Font: IBM Plex Sans (Variable)
const ibmPlexSans = localFont({
  src: [
    {
      path: "./fonts/IBM_Plex_Sans/IBMPlexSans-VariableFont_wdth,wght.ttf",
      style: "normal",
    },
    {
      path: "./fonts/IBM_Plex_Sans/IBMPlexSans-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-ibm-plex-sans",
  display: "swap",
  preload: true,
});

// Display Font: Bebas Neue
const bebasNeue = localFont({
  src: [
    {
      path: "./fonts/Bebas_Neue/BebasNeue-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-bebas-neue",
  display: "swap",
});

// Alternative Sans: Schibsted Grotesk (Variable)
const schibstedGrotesk = localFont({
  src: [
    {
      path: "./fonts/Schibsted_Grotesk/SchibstedGrotesk-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "./fonts/Schibsted_Grotesk/SchibstedGrotesk-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-schibsted-grotesk",
  display: "swap",
});

// Monospace Font: Martian Mono (Variable)
const martianMono = localFont({
  src: [
    {
      path: "./fonts/Martian_Mono/MartianMono-VariableFont_wdth,wght.ttf",
    },
  ],
  variable: "--font-martian-mono",
  display: "swap",
});

// Additional Fonts: Fira Sans (Full Family)
const firaSans = localFont({
  src: [
    { path: "./fonts/Fira_Sans/FiraSans-Light.ttf", weight: "300", style: "normal" },
    {
      path: "./fonts/Fira_Sans/FiraSans-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    { path: "./fonts/Fira_Sans/FiraSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Fira_Sans/FiraSans-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/Fira_Sans/FiraSans-Medium.ttf", weight: "500", style: "normal" },
    {
      path: "./fonts/Fira_Sans/FiraSans-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    { path: "./fonts/Fira_Sans/FiraSans-SemiBold.ttf", weight: "600", style: "normal" },
    {
      path: "./fonts/Fira_Sans/FiraSans-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    { path: "./fonts/Fira_Sans/FiraSans-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/Fira_Sans/FiraSans-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-fira-sans",
  display: "swap",
});

// Monospace Alternative: Fira Mono
const firaMono = localFont({
  src: [
    { path: "./fonts/Fira_Mono/FiraMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Fira_Mono/FiraMono-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Fira_Mono/FiraMono-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-fira-mono",
  display: "swap",
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ComicWise - Modern Comic Reading Platform",
  description:
    "Read your favorite manga, manhwa, and manhua online. Track your reading progress and discover new comics.",
  keywords: ["comics", "manga", "manhwa", "manhua", "webtoon", "reading"],
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "000000" },
  ],
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta content="IE=edge" httpEquiv="x-ua-compatible" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://ik.imagekit.io" rel="preconnect" />
        <link href="https://res.cloudinary.com" rel="dns-prefetch" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSans.variable}
          ${bebasNeue.variable}
          ${schibstedGrotesk.variable}
          ${martianMono.variable}
          ${firaSans.variable}
          ${firaMono.variable}
          font-sans antialiased`}
      >
        <Providers attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="container mx-auto flex-1 px-4 py-6">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
