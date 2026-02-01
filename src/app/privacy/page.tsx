import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Metadata } from "next";

/* eslint-disable react/no-unescaped-entities */

export const metadata: Metadata = {
  title: "Privacy Policy - ComicWise",
  description:
    "Learn how ComicWise collects, uses, and protects your personal information. GDPR and CCPA compliant privacy policy.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  const lastUpdated = "February 1, 2026";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-8 text-muted-foreground">
        Last updated: <time dateTime="2026-02-01">{lastUpdated}</time>
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="lead mb-8 text-lg">
          This Privacy Policy describes how ComicWise collects, uses, and protects your personal
          information. We are committed to protecting your privacy and complying with GDPR, CCPA,
          and other applicable data protection laws.
        </p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="information-we-collect">
            <AccordionTrigger className="text-left text-xl font-semibold">
              1. Information We Collect
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                <strong>Information you provide directly:</strong>
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Account information (name, email address, username)</li>
                <li>Profile customizations (avatar, bio, preferences)</li>
                <li>User-generated content (comments, ratings, reviews)</li>
                <li>Communications with us (support inquiries, feedback)</li>
                <li>
                  Payment information (if applicable, processed securely via third-party providers)
                </li>
              </ul>

              <p className="mt-4">
                <strong>Information collected automatically:</strong>
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, reading progress)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log files (access times, error logs)</li>
              </ul>

              <p className="mt-4">
                <strong>Information from third parties:</strong>
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>OAuth authentication data (Google, GitHub)</li>
                <li>Analytics providers (aggregated user behavior)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-we-use">
            <AccordionTrigger className="text-left text-xl font-semibold">
              2. How We Use Your Information
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>We use the information we collect to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your reading experience and recommendations</li>
                <li>Authenticate your account and prevent fraud</li>
                <li>Communicate with you about updates, new features, and support</li>
                <li>Analyze usage patterns to enhance platform performance</li>
                <li>Enforce our Terms of Service and protect against abuse</li>
                <li>Comply with legal obligations and respond to lawful requests</li>
                <li>Send marketing communications (with your consent, where required)</li>
              </ul>

              <p className="mt-4">
                <strong>Legal bases for processing (GDPR):</strong>
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Performance of contract (providing our services)</li>
                <li>Legitimate interests (improving platform, preventing abuse)</li>
                <li>Legal obligation (compliance with laws)</li>
                <li>Consent (marketing communications, optional features)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cookies">
            <AccordionTrigger className="text-left text-xl font-semibold">
              3. Cookies and Tracking Technologies
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Essential cookies:</strong> Required for authentication, security, and
                  core functionality
                </li>
                <li>
                  <strong>Performance cookies:</strong> Help us understand how visitors interact
                  with our site
                </li>
                <li>
                  <strong>Functional cookies:</strong> Remember your preferences and settings
                </li>
                <li>
                  <strong>Analytics cookies:</strong> Measure and improve site performance
                </li>
              </ul>

              <p className="mt-4">
                You can control cookies through your browser settings. Note that disabling certain
                cookies may affect site functionality.
              </p>

              <p className="mt-4">
                <strong>Do Not Track:</strong> We honor Do Not Track browser signals where
                applicable.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sharing">
            <AccordionTrigger className="text-left text-xl font-semibold">
              4. Information Sharing and Disclosure
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>We may share your information with:</p>

              <p className="mt-4">
                <strong>Service Providers:</strong>
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Cloud hosting providers (Vercel, Neon)</li>
                <li>Email service providers (for transactional emails)</li>
                <li>Analytics platforms (Google Analytics, Sentry)</li>
                <li>Payment processors (if applicable)</li>
                <li>CDN and image optimization services (ImageKit)</li>
              </ul>

              <p className="mt-4">
                <strong>Legal Requirements:</strong>
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>To comply with legal obligations or court orders</li>
                <li>To protect our rights, property, or safety</li>
                <li>To prevent fraud or security threats</li>
              </ul>

              <p className="mt-4">
                <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale
                of assets, your information may be transferred to the acquiring entity.
              </p>

              <p className="mt-4">
                <strong>With Your Consent:</strong> We may share information for other purposes with
                your explicit consent.
              </p>

              <p className="mt-4 font-semibold">
                We do not sell your personal information to third parties.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-retention">
            <AccordionTrigger className="text-left text-xl font-semibold">
              5. Data Retention
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>We retain your information for as long as necessary to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Provide our services and fulfill our obligations</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Resolve disputes and enforce our agreements</li>
              </ul>

              <p className="mt-4">
                When you delete your account, we anonymize or delete your personal information
                within 30 days, except where we are required to retain it by law. Some information
                (e.g., anonymized analytics data) may be retained indefinitely.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="your-rights">
            <AccordionTrigger className="text-left text-xl font-semibold">
              6. Your Privacy Rights
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                <strong>For all users:</strong>
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Access, update, or delete your account information</li>
                <li>Opt-out of marketing communications</li>
                <li>Disable cookies through browser settings</li>
                <li>Request a copy of your data</li>
              </ul>

              <p className="mt-4">
                <strong>GDPR Rights (EEA users):</strong>
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Right to access:</strong> Request a copy of your personal data
                </li>
                <li>
                  <strong>Right to rectification:</strong> Correct inaccurate information
                </li>
                <li>
                  <strong>Right to erasure:</strong> Request deletion of your data ("right to be
                  forgotten")
                </li>
                <li>
                  <strong>Right to restriction:</strong> Limit how we use your data
                </li>
                <li>
                  <strong>Right to data portability:</strong> Receive your data in a portable format
                </li>
                <li>
                  <strong>Right to object:</strong> Object to certain data processing activities
                </li>
                <li>
                  <strong>Right to withdraw consent:</strong> Where processing is based on consent
                </li>
              </ul>

              <p className="mt-4">
                <strong>CCPA Rights (California residents):</strong>
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Right to know what personal information is collected</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of sale (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>

              <p className="mt-4">
                To exercise your rights, email us at{" "}
                <a href="mailto:privacy@comicwise.app" className="text-primary underline">
                  privacy@comicwise.app
                </a>{" "}
                or use the contact form.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="security">
            <AccordionTrigger className="text-left text-xl font-semibold">
              7. Data Security
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Encryption in transit (HTTPS/TLS) and at rest</li>
                <li>Secure authentication with bcrypt password hashing</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and least-privilege principles for staff</li>
                <li>Monitoring and logging for suspicious activity</li>
              </ul>

              <p className="mt-4">
                However, no system is 100% secure. We cannot guarantee absolute security. You are
                responsible for keeping your account credentials confidential.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="children">
            <AccordionTrigger className="text-left text-xl font-semibold">
              8. Children's Privacy
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                Our service is not directed to children under 13. We do not knowingly collect
                personal information from children under 13.
              </p>
              <p>
                If we become aware that a child under 13 has provided us with personal information,
                we will delete it immediately. If you believe a child under 13 has provided us with
                information, please contact us.
              </p>
              <p>
                Users between 13 and 18 should have parental or guardian consent before using our
                service.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="international">
            <AccordionTrigger className="text-left text-xl font-semibold">
              9. International Data Transfers
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                Your information may be transferred to and processed in countries outside your
                country of residence, including the United States, where data protection laws may
                differ.
              </p>
              <p>
                For EEA users, we ensure adequate safeguards are in place for international
                transfers, such as:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Adequacy decisions by the European Commission</li>
                <li>Other approved transfer mechanisms</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="changes">
            <AccordionTrigger className="text-left text-xl font-semibold">
              10. Changes to This Privacy Policy
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material
                changes by:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Posting the new policy on this page with an updated "Last Updated" date</li>
                <li>Sending you an email notification (for significant changes)</li>
                <li>Displaying a prominent notice on our platform</li>
              </ul>
              <p className="mt-4">
                Your continued use of the service after changes become effective constitutes
                acceptance of the updated policy.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact">
            <AccordionTrigger className="text-left text-xl font-semibold">
              11. Contact Us
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or your
                personal information, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacy@comicwise.app" className="text-primary underline">
                    privacy@comicwise.app
                  </a>
                </li>
                <li>
                  <strong>Contact Form:</strong>{" "}
                  <a href="/contact" className="text-primary underline">
                    comicwise.app/contact
                  </a>
                </li>
                <li>
                  <strong>Data Protection Officer:</strong> dpo@comicwise.app
                </li>
              </ul>

              <p className="mt-4">
                For GDPR-related inquiries, you also have the right to lodge a complaint with your
                local data protection authority.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 rounded-lg border bg-muted p-6">
          <p className="text-sm text-muted-foreground">
            <strong>Your Privacy Matters:</strong> We are committed to transparency and protecting
            your privacy. This policy explains our practices in plain language. If anything is
            unclear, please don't hesitate to contact us.
          </p>
        </div>
      </div>
    </div>
  );
}
