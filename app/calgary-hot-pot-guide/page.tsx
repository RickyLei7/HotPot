import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Taiwanese & Japanese Hot Pot in Calgary | Centre St HotPot",
  description:
    "A local guide to Taiwanese and Japanese-style individual hot pot in Calgary, including soup bases, combo specials, Taiwanese snacks, milk tea, reservations, address, and FAQ.",
  alternates: {
    canonical: "/calgary-hot-pot-guide",
  },
  openGraph: {
    title: "Taiwanese & Japanese Hot Pot in Calgary | Centre St HotPot",
    description:
      "Find Taiwanese and Japanese-style individual hot pot in Calgary with soup bases, meats, seafood, Taiwanese snacks, milk tea, and table reservations.",
    url: "https://centrestjhotpot.ca/calgary-hot-pot-guide/",
    images: ["/assets/dish-sukiyaki.webp"],
  },
};

const guideFaqs = [
  [
    "Where can I find Taiwanese hot pot in Calgary?",
    "Centre Street Japanese HotPot, also known as 鼎鑽火鍋, serves Taiwanese and Japanese-style individual hot pot at 2213 Centre St N #2243 in Calgary.",
  ],
  [
    "Is Taiwanese hot pot similar to Japanese hot pot?",
    "Yes. Taiwanese hot pot and Japanese-style hot pot often share a personal hot pot dining format with soup bases, meats, vegetables, rice or noodles, snacks, and drinks.",
  ],
  [
    "Is Centre Street Japanese HotPot good for group dining?",
    "Yes. The restaurant is suitable for friends gatherings, family meals, celebrations, and group dining. Call ahead for larger groups.",
  ],
  [
    "How do I reserve a table?",
    "Call (403) 455-3188 for reservations, group dining, and today's table availability.",
  ],
  [
    "卡加利哪裡可以吃台式火鍋？",
    "鼎鑽火鍋 Centre Street Japanese HotPot 位於 2213 Centre St N #2243, Calgary, AB T2E 2T4，提供台式與日式風格的一人一鍋、多款湯底、台式小吃、飯麵和奶茶。",
  ],
];

const guideSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://centrestjhotpot.ca/calgary-hot-pot-guide/#article",
      headline: "Taiwanese & Japanese Hot Pot in Calgary",
      description:
        "A local guide to Taiwanese and Japanese-style individual hot pot in Calgary, including soup bases, combo specials, Taiwanese snacks, milk tea, reservations, and FAQ.",
      url: "https://centrestjhotpot.ca/calgary-hot-pot-guide/",
      about: [
        "Taiwanese hot pot Calgary",
        "Japanese hot pot Calgary",
        "Calgary individual hot pot",
        "卡加利台式火鍋",
        "卡加利一人一鍋",
      ],
      mainEntityOfPage: "https://centrestjhotpot.ca/calgary-hot-pot-guide/",
      publisher: {
        "@id": "https://centrestjhotpot.ca/#restaurant",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://centrestjhotpot.ca/calgary-hot-pot-guide/#faq",
      mainEntity: guideFaqs.map(([question, answer]) => ({
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

export default function CalgaryHotPotGuidePage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideSchema) }}
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
          <p className="eyebrow">Calgary hot pot guide</p>
          <h1>Taiwanese & Japanese Hot Pot in Calgary</h1>
          <p className="hero-text">
            A practical guide for guests looking for 台式與日式風格的一人一鍋,
            soup base variety, Taiwanese snacks, milk tea, and a table they can reserve.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="tel:+14034553188">
              Call (403) 455-3188 to Reserve
            </a>
            <Link className="secondary-action" href="/menu">
              View Menu
            </Link>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="guide-layout">
          <article className="guide-copy">
            <p className="eyebrow">Why this style</p>
            <h2>台式火鍋與日式火鍋，都很適合一人一鍋。</h2>
            <p>
              Taiwanese hot pot and Japanese-style hot pot both work well for personal hot pot dining:
              each guest can choose a soup base, meat, vegetables, rice or noodles, and add snacks or drinks.
              At Centre Street Japanese HotPot, the menu combines this individual hot pot format with
              Taiwanese snacks, rice and noodle bowls, and milk tea.
            </p>
            <p>
              This makes the restaurant a practical choice for solo meals, casual dinners,
              family dining, friends gatherings, and group dining in Calgary.
            </p>
          </article>
          <aside className="guide-card">
            <h2>Quick facts</h2>
            <p><strong>Restaurant:</strong> Centre Street Japanese HotPot / 鼎鑽火鍋</p>
            <p><strong>Style:</strong> Taiwanese and Japanese-style individual hot pot</p>
            <p><strong>Address:</strong> 2213 Centre St N #2243, Calgary, AB T2E 2T4</p>
            <p><strong>Reserve:</strong> <a href="tel:+14034553188">(403) 455-3188</a></p>
          </aside>
        </div>
      </section>

      <section className="weekly-picks">
        <div>
          <p className="eyebrow">What to order</p>
          <h2>A simple first visit order.</h2>
        </div>
        <div className="weekly-picks-grid">
          <article>
            <img src="/assets/dish-sukiyaki.webp" alt="Sukiyaki hot pot soup base in Calgary" width="900" height="675" loading="lazy" decoding="async" />
            <div>
              <h3>Start with hot pot</h3>
              <p>Choose a soup base such as Sukiyaki, Spicy, Tomato, Miso, or Tom Yum Kung.</p>
            </div>
          </article>
          <article>
            <img src="/assets/dish-popcorn-chicken.webp" alt="Taiwanese snack at Centre Street Japanese HotPot" width="900" height="675" loading="lazy" decoding="async" />
            <div>
              <h3>Add Taiwanese snacks</h3>
              <p>Pair the hot pot with fried chicken, takoyaki, spring rolls, or other shareable sides.</p>
            </div>
          </article>
          <article>
            <img src="/assets/milk-tea-photo.webp" alt="Milk tea at Centre Street Japanese HotPot" width="900" height="1200" loading="lazy" decoding="async" />
            <div>
              <h3>Finish with milk tea</h3>
              <p>Milk tea and drinks make the meal work for casual dinners and group gatherings.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="content-section">
        <div className="faq-list">
          {guideFaqs.map(([question, answer]) => (
            <article key={question}>
              <h2>{question}</h2>
              <p>{answer}</p>
            </article>
          ))}
          <article>
            <h2>Next step</h2>
            <p>
              Read the focused <Link href="/calgary-taiwanese-hot-pot">Taiwanese hot pot guide</Link>,
              compare <Link href="/ayce-hot-pot-calgary">AYCE hot pot in Calgary</Link>,
              view the <Link href="/menu">menu</Link>, check <Link href="/contact">location and hours</Link>,
              or call <a href="tel:+14034553188">(403) 455-3188</a> to reserve a table.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
