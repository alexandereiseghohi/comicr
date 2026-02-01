"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* eslint-disable react/no-unescaped-entities */

const faqs = [
  {
    id: "account-creation",
    question: "How do I create an account?",
    answer:
      "You can create an account by clicking the 'Sign Up' button in the header. You can register using your email address and password, or sign in with Google or GitHub for faster access.",
  },
  {
    id: "password-reset",
    question: "I forgot my password. How do I reset it?",
    answer:
      "Click 'Sign In' in the header, then select 'Forgot Password'. Enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
  },
  {
    id: "bookmark-comics",
    question: "How do I bookmark a comic?",
    answer:
      "Navigate to any comic page and click the bookmark icon (heart or bookmark symbol) to save it to your bookmarks. You can view all your bookmarked comics from your profile under the 'Bookmarks' tab.",
  },
  {
    id: "reading-modes",
    question: "What reading modes are available?",
    answer:
      "ComicWise offers three reading modes: Single Page (one page at a time), Double Page (two pages side-by-side for manga-style reading), and Long Strip (continuous vertical scrolling). You can switch between modes using the controls in the reader interface.",
  },
  {
    id: "save-progress",
    question: "Does my reading progress get saved?",
    answer:
      "Yes! Your reading progress is automatically saved as you read. When you return to a comic, you'll be able to resume from where you left off. Progress is synced across all your devices when you're signed in.",
  },
  {
    id: "image-quality",
    question: "Can I change the image quality?",
    answer:
      "Yes. In the reader settings (gear icon), you can adjust image quality between Low, Medium, High, and Original. Lower quality loads faster on slower connections, while Original provides the highest visual fidelity.",
  },
  {
    id: "dark-mode",
    question: "How do I enable dark mode?",
    answer:
      "Click the theme toggle button in the header (sun/moon icon) to switch between light and dark modes. Your preference is saved automatically.",
  },
  {
    id: "rating-comics",
    question: "How do I rate a comic?",
    answer:
      "Navigate to a comic page and scroll to the rating section. Click on the star rating (1-5 stars) to submit your rating. You can optionally write a review to share your thoughts with other readers.",
  },
  {
    id: "comments",
    question: "Can I comment on chapters?",
    answer:
      "Yes! Each chapter has a comment section at the bottom of the page. You must be signed in to post comments. You can also reply to other users' comments to start a discussion.",
  },
  {
    id: "delete-account",
    question: "How do I delete my account?",
    answer:
      "Go to your profile settings and scroll to the bottom. Click 'Delete Account' and confirm your decision. Note: This action is permanent and cannot be undone. All your data, including bookmarks and comments, will be removed.",
  },
  {
    id: "report-issue",
    question: "How do I report a bug or technical issue?",
    answer:
      "Use our Contact form to report bugs or technical issues. Provide as much detail as possible, including your device, browser, and steps to reproduce the issue. We'll investigate and respond as soon as possible.",
  },
  {
    id: "mobile-app",
    question: "Is there a mobile app?",
    answer:
      "Currently, ComicWise is a web-based platform optimized for mobile browsers. We're working on native iOS and Android apps for the future. You can add ComicWise to your home screen for an app-like experience.",
  },
  {
    id: "content-request",
    question: "Can I request comics to be added?",
    answer:
      "While we're constantly adding new content, we cannot accept specific comic requests due to licensing and copyright restrictions. However, you can suggest genres or types of content you'd like to see via our Contact form.",
  },
  {
    id: "download-comics",
    question: "Can I download comics for offline reading?",
    answer:
      "Currently, offline downloads are not available. All comics must be read online through our platform. This helps us respect content creators' rights and licensing agreements.",
  },
  {
    id: "privacy-data",
    question: "How is my data protected?",
    answer:
      "We take privacy seriously. All data is encrypted in transit and at rest. We comply with GDPR and CCPA regulations. For full details, please read our Privacy Policy. You can request a copy of your data or request deletion at any time.",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">Help & FAQ</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Find answers to common questions about using ComicWise
      </p>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* FAQ Accordion */}
      {filteredFaqs.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {filteredFaqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left text-lg font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="rounded-lg border bg-muted p-8 text-center">
          <p className="text-muted-foreground">
            No results found for "<strong>{searchQuery}</strong>"
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or browse all questions above.
          </p>
        </div>
      )}

      {/* Contact Section */}
      <div className="mt-12 rounded-lg border bg-muted p-6">
        <h2 className="mb-2 text-xl font-semibold">Still need help?</h2>
        <p className="mb-4 text-muted-foreground">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <Button asChild>
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
