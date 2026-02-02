/* eslint-disable react/no-unescaped-entities */
import { type Metadata } from "next";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Terms of Service - ComicWise",
  description:
    "Read the ComicWise Terms of Service to understand your rights and responsibilities when using our comic reading platform.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  const lastUpdated = "February 1, 2026";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: <time dateTime="2026-02-01">{lastUpdated}</time>
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="lead mb-8 text-lg">
          Please read these Terms of Service carefully before using ComicWise. By accessing or using our service, you
          agree to be bound by these terms.
        </p>

        <Accordion className="w-full" collapsible type="single">
          <AccordionItem value="acceptance">
            <AccordionTrigger className="text-left text-xl font-semibold">1. Acceptance of Terms</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                By creating an account, accessing, or using the ComicWise platform, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <p>
                If you do not agree to these terms, please do not use our service. We reserve the right to modify these
                terms at any time, and your continued use of the service constitutes acceptance of those changes.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="accounts">
            <AccordionTrigger className="text-left text-xl font-semibold">2. User Accounts</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>To access certain features of ComicWise, you must create an account. You are responsible for:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Providing accurate and complete registration information</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>
              <p>
                You must be at least 13 years old to create an account. Users under 18 should have parental consent.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="content">
            <AccordionTrigger className="text-left text-xl font-semibold">3. Content and Usage</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>ComicWise provides access to comic content for personal, non-commercial use only. You agree to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Use the service only for lawful purposes</li>
                <li>Not reproduce, distribute, or create derivative works without permission</li>
                <li>Not use automated systems to access or download content in bulk</li>
                <li>Not circumvent any access restrictions or security measures</li>
                <li>Respect the intellectual property rights of content creators</li>
              </ul>
              <p>
                User-generated content (comments, ratings, reviews) must not contain offensive, illegal, or
                inappropriate material. We reserve the right to remove any content that violates these terms.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="intellectual-property">
            <AccordionTrigger className="text-left text-xl font-semibold">
              4. Intellectual Property Rights
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                All content available on ComicWise, including but not limited to comics, images, text, graphics, logos,
                and software, is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                The ComicWise name, logo, and all related names, logos, product and service names, designs, and slogans
                are trademarks of ComicWise or its affiliates. You may not use such marks without prior written
                permission.
              </p>
              <p>
                Content creators retain all rights to their original works. By using our platform, you agree to respect
                these rights and report any copyright infringement.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="user-conduct">
            <AccordionTrigger className="text-left text-xl font-semibold">
              5. User Conduct and Community Guidelines
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Harassing, threatening, or abusing other users</li>
                <li>Posting spam, advertisements, or solicitations</li>
                <li>Impersonating others or providing false information</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Interfering with or disrupting the service</li>
                <li>Violating any applicable local, state, national, or international law</li>
              </ul>
              <p>Violations may result in account suspension or termination without prior notice.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="disclaimers">
            <AccordionTrigger className="text-left text-xl font-semibold">
              6. Disclaimers and Warranties
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                AND NON-INFRINGEMENT.
              </p>
              <p>ComicWise does not warrant that:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>The service will be uninterrupted, secure, or error-free</li>
                <li>The results obtained from using the service will be accurate or reliable</li>
                <li>Any errors or defects will be corrected</li>
                <li>The service will meet your specific requirements</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="limitation">
            <AccordionTrigger className="text-left text-xl font-semibold">7. Limitation of Liability</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, COMICWISE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
                DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p>
                Our total liability in any matter arising out of or related to these terms is limited to the amount you
                paid us in the 12 months prior to the event giving rise to the liability.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="termination">
            <AccordionTrigger className="text-left text-xl font-semibold">8. Termination</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                We reserve the right to suspend or terminate your account and access to the service at any time, with or
                without cause, and with or without notice.
              </p>
              <p>
                You may terminate your account at any time through your account settings. Upon termination, your right
                to use the service will immediately cease.
              </p>
              <p>
                Sections of these terms that by their nature should survive termination will survive, including
                intellectual property provisions, disclaimers, and limitations of liability.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="changes">
            <AccordionTrigger className="text-left text-xl font-semibold">
              9. Changes to Service and Terms
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                We reserve the right to modify or discontinue the service (or any part thereof) at any time, with or
                without notice. We will not be liable to you or any third party for any modification, suspension, or
                discontinuance of the service.
              </p>
              <p>
                We may update these Terms of Service from time to time. We will notify you of material changes by
                posting the new terms on this page and updating the "Last Updated" date.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="governing-law">
            <AccordionTrigger className="text-left text-xl font-semibold">
              10. Governing Law and Dispute Resolution
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States, without
                regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising out of or relating to these terms or the service shall be resolved through binding
                arbitration, except that either party may seek injunctive or other equitable relief in court.
              </p>
              <p>You agree to waive any right to a jury trial or to participate in a class action lawsuit.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="miscellaneous">
            <AccordionTrigger className="text-left text-xl font-semibold">11. Miscellaneous</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>
                <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and ComicWise
                regarding the service and supersede all prior agreements.
              </p>
              <p>
                <strong>Severability:</strong> If any provision is found to be unenforceable, the remaining provisions
                will remain in full effect.
              </p>
              <p>
                <strong>Waiver:</strong> No waiver of any term shall be deemed a further or continuing waiver of such
                term or any other term.
              </p>
              <p>
                <strong>Assignment:</strong> You may not assign or transfer these terms without our prior written
                consent. We may assign these terms without restriction.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact">
            <AccordionTrigger className="text-left text-xl font-semibold">12. Contact Information</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <ul className="list-none space-y-2">
                <li>Email: legal@comicwise.app</li>
                <li>Contact Form: comicwise.app/contact</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="bg-muted mt-12 rounded-lg border p-6">
          <p className="text-muted-foreground text-sm">
            <strong>Note:</strong> By continuing to use ComicWise, you acknowledge that you have read, understood, and
            agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please
            discontinue your use of our service immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
