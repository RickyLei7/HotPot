import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Centre Street Japanese HotPot Calgary",
  description:
    "Frequently asked questions about Centre Street Japanese HotPot in Calgary, including reservations, Japanese hot pot, seafood options, group dining, location, and soup bases.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ | Centre Street Japanese HotPot Calgary",
    description:
      "Frequently asked questions about reservations, Japanese hot pot, seafood options, group dining, location, and soup bases.",
    url: "https://centrestjhotpot.ca/faq/",
    images: ["/assets/snack-lineup.webp"],
  },
};

const faqs = [
  [
    "Do you accept reservations?",
    "Please call us at (403) 455-3188 for reservation questions and group dining availability.",
  ],
  [
    "Do you offer Japanese hot pot?",
    "Yes. Centre Street Japanese HotPot offers a Japanese-style hot pot dining experience in Calgary with multiple soup bases, meats, vegetables, and customizable sides.",
  ],
  [
    "Do you have seafood options?",
    "Yes. Our menu features fresh seafood options along with premium meats, seasonal vegetables, and flavorful broths.",
  ],
  [
    "Where are you located in Calgary?",
    "We are located at 2213 Centre St N #2243, Calgary, AB T2E 2T4.",
  ],
  [
    "What type of restaurant is Centre Street Japanese HotPot?",
    "Centre Street Japanese HotPot is a Japanese hot pot restaurant in Calgary serving individual hot pot, soup bases, meats, seafood, vegetables, Taiwanese snacks, rice and noodle bowls, and milk tea.",
  ],
  [
    "Can I view the menu online?",
    "Yes. View our online menu for hot pot sets, soup bases, rice and noodles, appetizers, drinks, and full menu images.",
  ],
  [
    "Do you offer group dining?",
    "Yes. Centre Street Japanese HotPot is suitable for family dinners, friends, celebrations, and group dining. Please call ahead for larger groups.",
  ],
  [
    "Is All-You-Can-Eat Hot Pot available?",
    "All-You-Can-Eat Hot Pot is listed as coming soon. Please check the website or call (403) 455-3188 for the latest launch details.",
  ],
  [
    "What soup bases do you offer?",
    "Soup base options include Sukiyaki, Tom Yum Kung, Spicy, Miso, Tomato, Satay, Kimchi, Curry, Pickled Cabbage, and more.",
  ],
];

export default function FaqPage() {
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
        <a className="nav-call" href="tel:+14034553188">Call</a>
      </nav>

      <section className="page-hero faq-page-hero">
        <div>
          <p className="eyebrow">FAQ</p>
          <h1>Frequently Asked Questions</h1>
          <p className="hero-text">
            Answers about reservations, Japanese hot pot, seafood options, group dining,
            and visiting Centre Street Japanese HotPot in Calgary.
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <article key={question}>
              <h2>{question}</h2>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
