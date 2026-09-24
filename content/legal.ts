import type { PageHeader, PageSeo } from "@/content/pages"

/**
 * The privacy policy and the terms.
 *
 * Supplied by the business and transcribed rather than paraphrased: this is
 * the one kind of copy on the site where the exact wording is the point, so
 * it is kept as given and changed only where it was plainly wrong (below).
 *
 * The URLs are deliberately the WordPress ones - /privacy-policy/ and
 * /terms-conditions/ - rather than tidier new ones. Both are in the old
 * sitemap and linked from every page of the site being replaced, so keeping
 * the address means no redirect to maintain and no equity lost in the move.
 * See the redirect map in next.config.ts for the pages that could not keep
 * their address.
 *
 * Two corrections to the supplied text, both factual rather than editorial:
 *
 * - The contact address was given as "contact@cognvitilabs.com" in both
 *   documents - missing the "i" in Cogniviti, and not an address that
 *   exists. The pages render `site.email`, so there is one address on the
 *   site and a change to it reaches these pages too.
 * - The supplied text writes the site as https://www.cognivitilabs.com,
 *   while `siteUrl` in content/site.ts has no www. Rather than hardcode
 *   either, the pages render the canonical origin; if the live site turns
 *   out to be the www host, changing `siteUrl` changes these with it.
 *
 * A section is a heading and a run of blocks - a paragraph or a bulleted
 * list - in order. Several sections alternate between the two, and a fixed
 * body/list/after shape would have forced an invented sub-heading to hold a
 * second list.
 */

export type LegalBlock = { p: string } | { ul: readonly string[] }

export type LegalSection = {
  heading: string
  blocks: readonly LegalBlock[]
}

export type LegalDocument = {
  seo: PageSeo
  header: PageHeader
  /** The path this document is served at, with its trailing slash. */
  slug: string
  /** As it reads on the page. */
  effective: string
  /** The same date for the <time> element and the JSON-LD. */
  effectiveIso: string
  intro: readonly string[]
  sections: readonly LegalSection[]
  /** The sign-off: heading, the line before the address, and who to ask for. */
  contact: {
    heading: string
    body: string
    /** Named recipient, where the document names one. */
    attention?: string
  }
}

const EFFECTIVE = "1 January 2026"
const EFFECTIVE_ISO = "2026-01-01"

export const privacyPage: LegalDocument = {
  slug: "/privacy-policy/",
  seo: {
    title: "Privacy Policy",
    description:
      "How Cogniviti Labs collects, uses, discloses and protects personal data, in accordance with Singapore's PDPA.",
  },
  header: {
    trail: [{ label: "Home", href: "/" }, { label: "Privacy Policy" }],
    kicker: "Privacy Policy",
    heading: "How we handle your personal data",
    body: "Cogniviti Labs Pte. Ltd. is committed to protecting your personal data and complying with the Personal Data Protection Act 2012 (PDPA) of Singapore.",
  },
  effective: EFFECTIVE,
  effectiveIso: EFFECTIVE_ISO,
  intro: [
    "Cogniviti Labs Pte. Ltd. (“Cogniviti Labs”, “we”, “us”, or “our”) is committed to protecting your personal data and complying with the Personal Data Protection Act 2012 (PDPA) of Singapore.",
    "This Privacy Policy explains how we collect, use, disclose, and protect your personal data when you visit our website (the “Website”) or interact with us.",
  ],
  sections: [
    {
      heading: "1. Personal data we collect",
      blocks: [
        {
          p: "We may collect personal data that you voluntarily provide, including but not limited to:",
        },
        {
          ul: [
            "Full name",
            "Email address",
            "Company name",
            "Job title",
            "Contact number",
            "Information submitted through contact forms, enquiries, or email communications",
          ],
        },
        {
          p: "We may also automatically collect limited technical data such as:",
        },
        {
          ul: [
            "IP address",
            "Browser type and version",
            "Device information",
            "Pages visited and usage data",
          ],
        },
      ],
    },
    {
      heading: "2. Purpose of collection, use, and disclosure",
      blocks: [
        {
          p: "Your personal data may be collected, used, or disclosed for the following purposes:",
        },
        {
          ul: [
            "Responding to enquiries or requests",
            "Providing information about our services and offerings",
            "Communicating with you regarding business matters",
            "Improving website functionality and user experience",
            "Internal business operations and administrative purposes",
            "Complying with legal or regulatory requirements",
          ],
        },
        {
          p: "We will not use your personal data for purposes beyond those stated without your consent, unless permitted or required by law.",
        },
      ],
    },
    {
      heading: "3. Consent",
      blocks: [
        {
          p: "By providing your personal data or using our Website, you consent to the collection, use, and disclosure of your personal data as described in this Privacy Policy.",
        },
        {
          p: "You may withdraw your consent at any time by contacting us. Withdrawal of consent may affect our ability to continue providing certain services.",
        },
      ],
    },
    {
      heading: "4. Disclosure of personal data",
      blocks: [
        {
          p: "We do not sell or trade your personal data. We may disclose your personal data to:",
        },
        {
          ul: [
            "Third-party service providers supporting our business operations",
            "Professional advisers such as legal, financial, or IT consultants",
            "Government or regulatory authorities where required by law",
          ],
        },
        {
          p: "All third parties are required to protect your personal data and use it only for authorised purposes.",
        },
      ],
    },
    {
      heading: "5. Protection of personal data",
      blocks: [
        {
          p: "We implement reasonable administrative, technical, and physical safeguards to protect personal data against unauthorised access, disclosure, alteration, loss, or misuse.",
        },
      ],
    },
    {
      heading: "6. Retention of personal data",
      blocks: [
        {
          p: "Personal data is retained only for as long as necessary to fulfil the purposes for which it was collected or to meet legal and regulatory obligations. When no longer required, personal data is securely deleted or anonymised.",
        },
      ],
    },
    {
      heading: "7. Access and correction",
      blocks: [
        { p: "In accordance with the PDPA, you may request:" },
        {
          ul: [
            "Access to your personal data in our possession",
            "Correction of inaccurate or incomplete personal data",
          ],
        },
        {
          p: "Requests may be subject to identity verification and reasonable administrative fees.",
        },
      ],
    },
    {
      heading: "8. Accuracy of personal data",
      blocks: [
        {
          p: "You are responsible for ensuring that personal data provided to us is accurate, complete, and up to date. Please notify us of any changes to your personal information.",
        },
      ],
    },
    {
      heading: "9. Transfer of personal data outside Singapore",
      blocks: [
        {
          p: "Where personal data is transferred outside Singapore, we will take reasonable steps to ensure that the receiving party provides a level of protection comparable to that under the PDPA.",
        },
      ],
    },
    {
      heading: "10. Cookies and tracking technologies",
      blocks: [
        {
          p: "Our Website may use cookies or similar technologies to enhance functionality and analyse traffic. You may disable cookies via your browser settings, though some features of the Website may not function properly.",
        },
      ],
    },
    {
      heading: "11. Changes to this Privacy Policy",
      blocks: [
        {
          p: "We may update this Privacy Policy from time to time. Any changes will be posted on this page and will take effect immediately upon publication.",
        },
      ],
    },
  ],
  contact: {
    heading: "12. Contact information",
    body: "If you have any questions, requests, or concerns regarding this Privacy Policy or your personal data, please contact:",
    attention: "Data Protection Officer",
  },
}

export const termsPage: LegalDocument = {
  slug: "/terms-conditions/",
  seo: {
    title: "Terms & Conditions",
    description:
      "The terms governing access to and use of the Cogniviti Labs website, governed by the laws of Singapore.",
  },
  header: {
    trail: [{ label: "Home", href: "/" }, { label: "Terms and Conditions" }],
    kicker: "Terms and Conditions",
    heading: "The terms of using this site",
    body: "These Terms govern your access to and use of the Cogniviti Labs website. By accessing or using the Site, you agree to them. If you do not agree, you must not use the Site.",
  },
  effective: EFFECTIVE,
  effectiveIso: EFFECTIVE_ISO,
  intro: [
    "Welcome to the Cogniviti Labs website (the “Site”). These Terms and Conditions (“Terms”) govern your access to and use of the Site (“we”, “us”, “our”, Cogniviti Labs Pte. Ltd.). By accessing or using the Site, you agree to these Terms. If you do not agree, you must not use the Site.",
  ],
  sections: [
    {
      heading: "1. Acceptance of terms",
      blocks: [
        {
          p: "By accessing or using our Site, you confirm that you are at least 18 years old or accessing the Site with the consent of a parent or legal guardian. You agree to comply with all applicable laws and these Terms.",
        },
      ],
    },
    {
      heading: "2. Changes to terms",
      blocks: [
        {
          p: "We may update these Terms from time to time without prior notice. The updated version will be posted on the Site and will become effective immediately. Continued use of the Site constitutes acceptance of the revised Terms.",
        },
      ],
    },
    {
      heading: "3. Use of the Site",
      blocks: [
        {
          p: "You agree to use the Site only for lawful purposes and in accordance with these Terms. You must not:",
        },
        {
          ul: [
            "Use the Site in any manner that could damage, disable, or impair the Site.",
            "Upload, post, or transmit any content that is unlawful, harmful, misleading, or infringes third-party rights.",
            "Attempt to gain unauthorised access to any portion of the Site or its systems.",
          ],
        },
      ],
    },
    {
      heading: "4. Intellectual property rights",
      blocks: [
        {
          p: "All content available on the Site, including but not limited to text, graphics, logos, images, icons, videos, and software, is the property of Cogniviti Labs Pte. Ltd. or its licensors and is protected by applicable intellectual property laws.",
        },
        {
          p: "You may view or download content solely for personal, non-commercial use. Any other use, including reproduction, modification, distribution, or republication, is strictly prohibited without prior written consent.",
        },
      ],
    },
    {
      heading: "5. Professional services disclaimer",
      blocks: [
        {
          p: "All information provided on the Site is for general informational purposes only and does not constitute legal, financial, procurement, or professional advice. Any services provided by Cogniviti Labs Pte. Ltd. are governed by separate written agreements.",
        },
      ],
    },
    {
      heading: "6. Privacy",
      blocks: [
        {
          p: "Your use of the Site is also governed by our Privacy Policy. By using the Site, you consent to the collection and use of information as described in that policy.",
        },
      ],
    },
    {
      heading: "7. Third-party links",
      blocks: [
        {
          p: "The Site may contain links to external websites operated by third parties. Cogniviti Labs Pte. Ltd. does not control or endorse these websites and is not responsible for their content, policies, or practices.",
        },
      ],
    },
    {
      heading: "8. Limitation of liability",
      blocks: [
        {
          p: "To the fullest extent permitted by law, Cogniviti Labs Pte. Ltd. shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising out of or related to your use of the Site or reliance on its content.",
        },
      ],
    },
    {
      heading: "9. Indemnification",
      blocks: [
        {
          p: "You agree to indemnify and hold harmless Cogniviti Labs Pte. Ltd., its directors, officers, employees, and affiliates from any claims, damages, liabilities, costs, or expenses arising from your use of the Site or violation of these Terms.",
        },
      ],
    },
    {
      heading: "10. Governing law and jurisdiction",
      blocks: [
        {
          p: "These Terms shall be governed by and construed in accordance with the laws of Singapore. Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of Singapore.",
        },
      ],
    },
    {
      heading: "11. Termination",
      blocks: [
        {
          p: "We reserve the right to suspend or terminate access to the Site at any time, without notice, if we believe these Terms have been violated.",
        },
      ],
    },
  ],
  contact: {
    heading: "12. Contact information",
    body: "If you have any questions about these Terms, please contact:",
  },
}
