import type { Metadata } from "next";
import Link from "next/link";
import AboutContent from "../about-content";

export const metadata: Metadata = {
  title: "About Centre Street Japanese HotPot | 鼎鑽火鍋 Calgary",
  description:
    "Learn about Centre Street Japanese HotPot, a Japanese hot pot restaurant in Calgary serving premium meats, fresh seafood, fresh vegetables, signature broths, and house-made sauces.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Centre Street Japanese HotPot | 鼎鑽火鍋 Calgary",
    description:
      "Learn about Centre Street Japanese HotPot, a Calgary Japanese hot pot restaurant focused on fresh ingredients, signature broths, and welcoming service.",
    url: "https://centrestjhotpot.ca/about/",
    images: ["/assets/soup-lineup.webp"],
  },
};

export default function AboutPage() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand-mark" href="/" aria-label="Centre Street Japanese Hotpot home">
          <img src="/assets/brand-logo-wide.webp" alt="Centre Street Japanese Hotpot" />
        </Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/#visit">Visit</Link>
        </div>
        <a className="nav-call" href="tel:+14034553188">
          Reserve
        </a>
      </nav>

      <AboutContent isStandalone />
    </main>
  );
}
