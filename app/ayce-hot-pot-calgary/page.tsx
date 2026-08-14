import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "AYCE Hot Pot Calgary $28.99 | 15 Soup Bases & 19 Snacks",
  description:
    "AYCE hot pot in Calgary for $28.99 + tax with soup base included, four meat choices and an optional 19-snack upgrade. Call (403) 455-3188 to reserve.",
  alternates: {
    canonical: "/ayce-hot-pot-calgary",
    languages: {
      "en-CA": "/ayce-hot-pot-calgary/",
      "zh-Hant-CA": "/zh-hant/ayce-hot-pot-calgary/",
      "x-default": "/ayce-hot-pot-calgary/",
    },
  },
  openGraph: {
    title: "AYCE Hot Pot Calgary $28.99 | 15 Soup Bases & 19 Snacks",
    description:
      "AYCE hot pot in Calgary for $28.99 + tax with soup base included, four meat choices, 15 soup bases, and an optional 19-snack upgrade.",
    url: "https://centrestjhotpot.ca/ayce-hot-pot-calgary/",
    images: ["/assets/ayce-hotpot-menu-preview.webp"],
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
    "Yes. Add 19 all-you-can-eat appetizers for +$3.99 per person. Everyone at the same table must upgrade. Options include Taiwanese fried chicken, takoyaki, crispy chicken cutlet, golden fried buns, crispy squid legs, spring rolls, fries, and more.",
  ],
  [
    "Are there AYCE rules or limits?",
    "AYCE Hot Pot is dine-in only with a 1.5 hour time limit. Please order responsibly and avoid food waste.",
  ],
];

const ayceSnacks = [
  "Signature Taiwanese Fried Chicken", "Takoyaki (6 pcs)", "Crispy Chicken Cutlet",
  "Golden Fried Buns", "Crispy Squid Legs", "Deep Fried King Mushroom",
  "Crispy Wontons (8 pcs)", "Deep Fried Dumplings (8 pcs)", "Chicken Spring Rolls (6 pcs)",
  "Veggie Spring Rolls (5 pcs)", "Popcorn Chicken", "Fish Balls (6 pcs)",
  "Chinese Donut", "French Fries", "Sweet Potato Fries", "Golden Onion Rings",
  "Korean Fish Cake", "Luncheon Meat (Spam)", "Edamame",
];

const ayceSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://centrestjhotpot.ca/ayce-hot-pot-calgary/#webpage",
      name: "AYCE Hot Pot Calgary $28.99 | 15 Soup Bases & 19 Snacks",
      description:
        "AYCE hot pot in Calgary for $28.99 + tax with soup base included, four meat choices, 15 soup bases, an optional 19-snack upgrade, kids pricing, and reservation details.",
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
  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=2213+Centre+St+N+%232243%2C+Calgary%2C+AB+T2E+2T4";

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ayceSchema) }}
      />
      <SiteNav currentPath="/ayce-hot-pot-calgary/" />

      <section className="page-hero guide-page-hero">
        <div>
          <p className="eyebrow">AYCE hot pot Calgary</p>
          <h1>All-You-Can-Eat Hot Pot in Calgary</h1>
          <p className="hero-text">
            Centre Street Japanese HotPot serves AYCE Hot Pot in Calgary for $28.99 + tax,
            with soup base included, server-ordered meats, an optional 19-item appetizer upgrade,
            and phone reservations for today&apos;s availability.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="tel:+14034553188">
              Call (403) 455-3188 to Reserve
            </a>
            <a className="secondary-action" href={directionsUrl} target="_blank" rel="noreferrer">
              Get Directions
            </a>
            <Link className="secondary-action" href="/menu#ayce-hotpot">
              View Menu Details
            </Link>
          </div>
          <p className="hero-availability">Today&apos;s table availability: call ahead · 2213 Centre St N #2243</p>
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
              <p>Choose from 19 all-you-can-eat appetizers. Everyone at the table must upgrade.</p>
            </article>
          </div>
        </div>
        <a className="ayce-card" href="/assets/ayce-hotpot-menu.webp">
          <span>$28.99 + tax</span>
          <img src="/assets/ayce-hotpot-menu-preview-360.webp" srcSet="/assets/ayce-hotpot-menu-preview-360.webp 360w, /assets/ayce-hotpot-menu-preview.webp 495w" sizes="(max-width: 760px) calc(100vw - 32px), 420px" alt="AYCE Hot Pot poster with $28.99 pricing and all 19 appetizer upgrade items" width="495" height="640" loading="lazy" decoding="async" />
        </a>
      </section>

      <section className="ayce-reserve-strip" aria-label="AYCE reservations and location">
        <div>
          <strong>Planning AYCE today?</strong>
          <span>Mon-Fri 5-10:30 PM · Sat-Sun 12-10:30 PM</span>
        </div>
        <div className="ayce-reserve-actions">
          <a className="primary-action" href="tel:+14034553188">Call to Reserve</a>
          <a className="secondary-action dark" href={directionsUrl} target="_blank" rel="noreferrer">Directions</a>
        </div>
      </section>

      <section className="menu-section" id="ayce-snacks">
        <div className="section-heading">
          <p className="eyebrow">19-item appetizer upgrade</p>
          <h2>Add 19 all-you-can-eat snacks for +$3.99 per person.</h2>
          <p>Everyone at the same table must upgrade.</p>
        </div>
        <div className="price-list ayce-snack-list">
          {ayceSnacks.map((snack) => <div key={snack}><span>{snack}</span><strong>AYCE</strong></div>)}
        </div>
        <div className="combo-actions">
          <a className="primary-action" href="/menu/centre-street-ayce-menu.pdf" target="_blank" rel="noreferrer">Open AYCE Menu</a>
          <a className="secondary-action dark" href="/menu/centre-street-ayce-menu.pdf" download>Download PDF</a>
        </div>
      </section>

      <section className="weekly-picks">
        <div>
          <p className="eyebrow">Snack upgrade</p>
          <h2>Add all-you-can-eat snacks to the hot pot table.</h2>
        </div>
        <div className="weekly-picks-grid">
          <article>
            <img src="/assets/ayce-fried-chicken-224.webp" srcSet="/assets/ayce-fried-chicken-160.webp 160w, /assets/ayce-fried-chicken-224.webp 224w, /assets/ayce-fried-chicken-320.webp 320w, /assets/ayce-fried-chicken-640.webp 640w, /assets/ayce-fried-chicken.webp 900w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Signature Taiwanese fried chicken for AYCE snack upgrade" width="900" height="1125" loading="lazy" decoding="async" />
            <div>
              <h3>Signature Taiwanese Fried Chicken</h3>
              <p>Hot, crispy, and made to order as part of the AYCE snack upgrade.</p>
            </div>
          </article>
          <article>
            <img src="/assets/ayce-takoyaki-224.webp" srcSet="/assets/ayce-takoyaki-160.webp 160w, /assets/ayce-takoyaki-224.webp 224w, /assets/ayce-takoyaki-320.webp 320w, /assets/ayce-takoyaki-640.webp 640w, /assets/ayce-takoyaki.webp 900w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Takoyaki for AYCE snack upgrade in Calgary" width="900" height="1125" loading="lazy" decoding="async" />
            <div>
              <h3>Takoyaki</h3>
              <p>Six-piece takoyaki with sauce and bonito flakes.</p>
            </div>
          </article>
          <article>
            <img src="/assets/ayce-snack-duo-224.webp" srcSet="/assets/ayce-snack-duo-160.webp 160w, /assets/ayce-snack-duo-224.webp 224w, /assets/ayce-snack-duo-320.webp 320w, /assets/ayce-snack-duo-640.webp 640w, /assets/ayce-snack-duo.webp 900w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="AYCE snack duo with fried chicken and takoyaki" width="900" height="1125" loading="lazy" decoding="async" />
            <div>
              <h3>More snack choices</h3>
              <p>Crispy chicken cutlet, golden fried buns, and crispy squid legs are also available.</p>
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
