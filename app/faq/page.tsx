import type { Metadata } from "next";

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
    "Do you offer group dining?",
    "Yes. Centre Street Japanese HotPot is suitable for family dinners, friends, celebrations, and group dining. Please call ahead for larger groups.",
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
