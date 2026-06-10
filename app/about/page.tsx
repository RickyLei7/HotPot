import type { Metadata } from "next";
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
        <a className="brand-mark" href="/" aria-label="Centre Street Japanese Hotpot home">
          <img src="/assets/brand-logo-wide.webp" alt="Centre Street Japanese Hotpot" />
        </a>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/menu">Menu</a>
          <a href="/about">About</a>
          <a href="/faq">FAQ</a>
          <a href="/contact">Contact</a>
          <a href="/#visit">Visit</a>
        </div>
        <a className="nav-call" href="tel:+14034553188">
          Call
        </a>
      </nav>

      <AboutContent isStandalone />
    </main>
  );
}
