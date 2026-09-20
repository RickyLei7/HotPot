import type { Metadata } from "next";
import AboutContent from "../about-content";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "About Centre Street Japanese HotPot | Calgary",
  description:
    "Meet Centre Street Japanese HotPot, a Calgary restaurant serving Taiwanese and Japanese-style hot pot, 15 soup bases, snacks and milk tea.",
  alternates: {
    canonical: "/about",
    languages: {
      "en-CA": "/about/",
      "zh-Hant-CA": "/zh-hant/about/",
      "x-default": "/about/",
    },
  },
  openGraph: {
    title: "About Centre Street Japanese HotPot | Calgary",
    description:
      "Centre Street Japanese HotPot serves personal hot pot, $28.99 AYCE, Taiwanese snacks, rice and noodle bowls, and milk tea in Calgary.",
    url: "https://centrestjhotpot.ca/about/",
    images: ["/assets/soup-lineup.webp"],
  },
};

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://centrestjhotpot.ca/about/#webpage",
  url: "https://centrestjhotpot.ca/about/",
  name: "About Centre Street Japanese HotPot",
  description:
    "The story, dining style, ingredients, and hospitality behind Centre Street Japanese HotPot in Calgary.",
  about: { "@id": "https://centrestjhotpot.ca/#restaurant" },
  isPartOf: { "@id": "https://centrestjhotpot.ca/#website" },
};

export default function AboutPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }} />
      <SiteNav currentPath="/about/" />

      <AboutContent isStandalone />
    </main>
  );
}
