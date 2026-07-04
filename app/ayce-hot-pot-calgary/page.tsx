import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AYCE Hot Pot Calgary | All You Can Eat Hot Pot",
  description:
    "AYCE Hot Pot Calgary at Centre Street Japanese HotPot. All-you-can-eat hot pot is $28.99 + tax with soup base included, server-ordered meats, snack upgrade, kids pricing, and reservations by phone.",
  alternates: {
    canonical: "/ayce-hot-pot-calgary",
  },
  openGraph: {
    title: "AYCE Hot Pot Calgary | All You Can Eat Hot Pot",
    description:
      "All-you-can-eat hot pot in Calgary at Centre Street Japanese HotPot: $28.99 + tax, soup base included, meat ordered through your server, optional snack upgrade, and phone reservations.",
    url: "https://centrestjhotpot.ca/ayce-hot-pot-calgary/",
    images: ["/assets/ayce-snack-duo.webp"],
  },
};

const ayceFaqs = [
  [
    "Where can I find AYCE hot pot in Calgary?",
    "Centre Street Japanese HotPot offers AYCE Hot Pot in Calgary at 2213 Centre St N #2243. Call (403) 455-3188 for current table availability.",
  ],
  [
    "How much is all-you-can-eat hot pot?",
    "All-You-Can-Eat Hot Pot is $28.99 + tax. Soup base is included, and meat is ordered through your server.",
  ],
  [
    "What meats are included with AYCE hot pot?",
    "The AYCE meat selection includes AAA beef, lamb, pork, and chicken. Each serving is 100g and is ordered through your server.",
  ],
  [
    "Can I add all-you-can-eat snacks?",
    "Yes. The all-you-can-eat snack upgrade is +$3.99. Everyone at the same table must upgrade. Snack options include Taiwanese fried chicken, takoyaki, crispy chicken cutlet, golden fried buns, crispy squid legs, and more.",
  ],
  [
    "Are there AYCE rules or limits?",
    "AYCE Hot Pot is dine-in only with a 1.5 hour time limit. Please order responsibly and avoid food waste.",
  ],
];

const ayceSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://centrestjhotpot.ca/ayce-hot-pot-calgary/#webpage",
      name: "AYCE Hot Pot Calgary",
      description:
        "All-you-can-eat hot pot in Calgary at Centre Street Japanese HotPot, including price, meats, snack upgrade, kids pricing, and reservation details.",
      url: "https://centrestjhotpot.ca/ayce-hot-pot-calgary/",
      about: [
        "AYCE hot pot Calgary",
        "all you can eat hot pot Calgary",
        "hot pot Calgary",
        "hot pot near me",
      ],
      mainEntityOfPage: "https://centrestjhotpot.ca/ayce-hot-pot-calgary/",
      publisher: {
        "@id": "https://centrestjhotpot.ca/#restaurant",
      },
    },
    {
      "@type": "Offer",
      "@id": "https://centrestjhotpot.ca/ayce-hot-pot-calgary/#offer",
      name: "All-You-Can-Eat Hot Pot",
      price: "28.99",
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
      itemOffered: {
        "@type": "MenuItem",
        name: "AYCE Hot Pot",
        description:
          "All-you-can-eat hot pot with soup base included, server-ordered meats, and 1.5 hour time limit.",
      },
      seller: {
        "@id": "https://centrestjhotpot.ca/#restaurant",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://centrestjhotpot.ca/ayce-hot-pot-calgary/#faq",
      mainEntity: ayceFaqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    },
  ],
};

export default function AyceHotPotCalgaryPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ayceSchema) }}
      />
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand-mark" href="/" aria-label="Centre Street Japanese Hotpot home">
          <img src="/assets/brand-logo-wide.webp" alt="Centre Street Japanese Hotpot" width="600" height="184" />
        </Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/#visit">Visit</Link>
        </div>
        <a className="nav-call" href="tel:+14034553188">Reserve</a>
      </nav>

      <section className="page-hero guide-page-hero">
        <div>
          <p className="eyebrow">AYCE hot pot Calgary</p>
          <h1>All-You-Can-Eat Hot Pot in Calgary</h1>
          <p className="hero-text">
            Centre Street Japanese HotPot serves AYCE Hot Pot in Calgary for $28.99 + tax,
            with soup base included, server-ordered meats, optional all-you-can-eat snacks,
            and phone reservations for today&apos;s availability.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="tel:+14034553188">
              Call (403) 455-3188 to Reserve
            </a>
            <Link className="secondary-action" href="/menu#ayce-hotpot">
              View Menu Details
            </Link>
          </div>
        </div>
      </section>

      <section className="ayce-promo" id="ayce-details">
        <div className="ayce-copy">
          <p className="eyebrow">All-you-can-eat hot pot</p>
          <h2>AYCE Hot Pot with soup base included.</h2>
          <p>
            The AYCE Hot Pot price is $28.99 + tax. Choose your soup base, then order meat
            through your server. Meat options include AAA beef, lamb, pork, and chicken.
            The time limit is 1.5 hours.
          </p>
          <div className="combo-price-grid">
            <article>
              <span>$28.99</span>
              <h3>AYCE Hot Pot</h3>
              <p>Soup base included. Meat is ordered through your server.</p>
            </article>
            <article>
              <span>+$3.99</span>
              <h3>Snack Upgrade</h3>
              <p>All-you-can-eat snacks for the whole table.</p>
            </article>
          </div>
        </div>
        <a className="ayce-card" href="/assets/ayce-hotpot.webp" aria-label="Open All-You-Can-Eat Hot Pot poster">
          <span>$28.99 + tax</span>
          <img src="/assets/ayce-snack-duo.webp" alt="AYCE Hot Pot Calgary snack upgrade with Taiwanese fried chicken and takoyaki" width="900" height="1125" loading="lazy" decoding="async" />
        </a>
      </section>

      <section className="weekly-picks">
        <div>
          <p className="eyebrow">Snack upgrade</p>
          <h2>Add all-you-can-eat snacks to the hot pot table.</h2>
        </div>
        <div className="weekly-picks-grid">
          <article>
            <img src="/assets/ayce-fried-chicken.webp" alt="Taiwanese fried chicken snack for AYCE hot pot in Calgary" width="900" height="1125" loading="lazy" decoding="async" />
            <div>
              <h3>Taiwanese fried chicken</h3>
              <p>Crispy Taiwanese fried chicken is one of the snack upgrade favorites.</p>
            </div>
          </article>
          <article>
            <img src="/assets/ayce-takoyaki.webp" alt="Takoyaki for all-you-can-eat hot pot in Calgary" width="900" height="1125" loading="lazy" decoding="async" />
            <div>
              <h3>Takoyaki and crispy sides</h3>
              <p>Snack options include takoyaki, crispy squid legs, crispy chicken cutlet, golden fried buns, and more.</p>
            </div>
          </article>
          <article>
            <img src="/assets/dish-sukiyaki.webp" alt="Soup base for all-you-can-eat hot pot in Calgary" width="900" height="675" loading="lazy" decoding="async" />
            <div>
              <h3>Soup base included</h3>
              <p>Start with a soup base, then build the table with meats, sides, snacks, and drinks.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="content-section">
        <div className="faq-list">
          {ayceFaqs.map(([question, answer]) => (
            <article key={question}>
              <h2>{question}</h2>
              <p>{answer}</p>
            </article>
          ))}
          <article>
            <h2>Related Calgary hot pot pages</h2>
            <p>
              Browse the <Link href="/menu">full menu</Link>, read the{" "}
              <Link href="/calgary-hot-pot-guide">Calgary hot pot guide</Link>, or check{" "}
              <Link href="/contact">location and hours</Link>.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
