import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "All You Can Eat Hot Pot Calgary | AYCE $28.99",
  description:
    "Calgary all-you-can-eat hot pot for $28.99 + tax with 15 soup bases, AAA beef, lamb, pork and chicken. Soup base included. Call (403) 455-3188.",
  alternates: {
    canonical: "/ayce-hot-pot-calgary",
    languages: {
      "en-CA": "/ayce-hot-pot-calgary/",
      "zh-Hant-CA": "/zh-hant/ayce-hot-pot-calgary/",
      "x-default": "/ayce-hot-pot-calgary/",
    },
  },
  openGraph: {
    title: "All You Can Eat Hot Pot Calgary | AYCE $28.99",
    description:
      "Calgary all-you-can-eat hot pot for $28.99 + tax with 15 soup bases, AAA beef, lamb, pork and chicken. Soup base included.",
    url: "https://centrestjhotpot.ca/ayce-hot-pot-calgary/",
    images: ["/assets/ayce-menu-2026-08-25-fast-480.webp"],
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
    "Yes. Add 19 all-you-can-eat appetizers for +$5.99 per person. Everyone at the same table must upgrade. Options include Taiwanese fried chicken, takoyaki, crispy chicken cutlet, golden fried buns, crispy squid legs, spring rolls, fries, and more.",
  ],
  [
    "How should guests order?",
    "AYCE Hot Pot is dine-in only. Please order responsibly and avoid food waste.",
  ],
];

const ayceSnackGroups = [
  {
    title: "Signature favourites",
    snacks: [
      "Signature Taiwanese Fried Chicken",
      "Takoyaki (6 pcs)",
      "Crispy Chicken Cutlet",
      "Crispy Squid Legs",
    ],
  },
  {
    title: "Dumplings & rolls",
    snacks: [
      "Crispy Wontons (8 pcs)",
      "Deep Fried Dumplings (8 pcs)",
      "Chicken Spring Rolls (6 pcs)",
      "Veggie Spring Rolls (5 pcs)",
    ],
  },
  {
    title: "Crispy sides",
    snacks: [
      "Golden Fried Buns",
      "Deep Fried King Mushroom",
      "Popcorn Chicken",
      "Chinese Donut",
      "French Fries",
      "Sweet Potato Fries",
      "Golden Onion Rings",
    ],
  },
  {
    title: "Hot pot extras",
    snacks: [
      "Fish Balls (6 pcs)",
      "Korean Fish Cake",
      "Luncheon Meat (Spam)",
      "Edamame",
    ],
  },
];

const ayceSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      dateModified: "2026-08-25",
      "@id": "https://centrestjhotpot.ca/ayce-hot-pot-calgary/#webpage",
      name: "All You Can Eat Hot Pot Calgary | AYCE $28.99",
      description:
        "Calgary all-you-can-eat hot pot for $28.99 + tax with 15 soup bases, AAA beef, lamb, pork and chicken, an optional 19-snack upgrade, kids pricing, and reservation details.",
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
          "All-you-can-eat hot pot with soup base included and server-ordered meats.",
      },
      seller: {
        "@id": "https://centrestjhotpot.ca/#restaurant",
      },
    },
    {
      "@type": "FAQPage",
      dateModified: "2026-08-25",
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
          <h1>All-You-Can-Eat Hot Pot Calgary · $28.99</h1>
          <p className="hero-text">
            Choose from 15 soup bases, all included in the $28.99 + tax AYCE price.
            AAA beef, lamb, pork, and chicken are ordered fresh through your server,
            with an optional 19-item all-you-can-eat appetizer upgrade.
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
          <h2>AYCE Hot Pot with soup base included</h2>
          <p>
            The AYCE Hot Pot price is $28.99 + tax. Choose your soup base, then order meat
            through your server. Meat options include AAA beef, lamb, pork, and chicken.
          </p>
          <div className="combo-price-grid">
            <article>
              <span>$28.99</span>
              <h3>AYCE Hot Pot</h3>
              <p>Soup base included. Meat is ordered through your server.</p>
            </article>
            <article>
              <span>+$5.99</span>
              <h3>Snack Upgrade</h3>
              <p>Choose from 19 all-you-can-eat appetizers. Everyone at the table must upgrade.</p>
            </article>
          </div>
        </div>
        <a className="ayce-card poster-thumbnail" href="#ayce-poster" aria-label="View the complete AYCE menu poster">
          <span className="price-badge">$28.99 + tax</span>
          <img src="/assets/ayce-menu-2026-08-25-fast-360.webp" srcSet="/assets/ayce-menu-2026-08-25-fast-360.webp 360w, /assets/ayce-menu-2026-08-25-fast-480.webp 480w" sizes="(max-width: 760px) calc(100vw - 32px), 420px" alt="AYCE Hot Pot poster with $28.99 pricing and all 19 appetizer upgrade items" width="480" height="622" loading="lazy" decoding="async" />
          <strong className="poster-open-label">View full menu</strong>
        </a>
      </section>

      <section className="poster-modal" id="ayce-poster" role="dialog" aria-modal="true" aria-labelledby="ayce-poster-title" data-close-target="ayce-details">
        <a className="modal-backdrop" href="#ayce-details" aria-label="Close full AYCE menu" />
        <div className="poster-frame">
          <span className="modal-label" id="ayce-poster-title">Full AYCE menu</span>
          <a className="modal-close" href="#ayce-details" aria-label="Close full AYCE menu">Close</a>
          <img src="/assets/ayce-menu-2026-08-24-599.webp" alt="Complete AYCE Hot Pot menu with $28.99 pricing and 19 appetizer choices" width="1200" height="1553" loading="lazy" decoding="async" />
        </div>
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
          <p className="eyebrow">All-you-can-eat snack upgrade</p>
          <h2>Add all 19 snack choices for +$5.99 per person</h2>
          <p>One upgrade includes every snack below. Everyone at the same table must choose the upgrade.</p>
        </div>
        <div className="ayce-snack-directory" aria-label="19 all-you-can-eat snack choices by category">
          {ayceSnackGroups.map((group) => (
            <section className="ayce-snack-group" key={group.title}>
              <h3>{group.title}<span>{group.snacks.length} choices</span></h3>
              <ul>
                {group.snacks.map((snack) => <li key={snack}>{snack}</li>)}
              </ul>
            </section>
          ))}
        </div>
        <div className="combo-actions">
          <a className="primary-action" href="/menu/centre-street-ayce-menu-2026-08.pdf" target="_blank" rel="noreferrer">Open AYCE Menu</a>
          <a className="secondary-action dark" href="/menu/centre-street-ayce-menu-2026-08.pdf" download>Download PDF</a>
        </div>
      </section>

      <section className="weekly-picks">
        <div>
          <p className="eyebrow">Snack upgrade</p>
          <h2>Add all-you-can-eat snacks to the hot pot table</h2>
        </div>
        <div className="weekly-picks-grid">
          <article>
            <img src="/assets/ayce-signature-fried-chicken-2026-08-18-224.webp" srcSet="/assets/ayce-signature-fried-chicken-2026-08-18-160.webp 160w, /assets/ayce-signature-fried-chicken-2026-08-18-224.webp 224w, /assets/ayce-signature-fried-chicken-2026-08-18-320.webp 320w, /assets/ayce-signature-fried-chicken-2026-08-18-640.webp 640w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Signature Taiwanese fried chicken for AYCE snack upgrade" width="640" height="360" loading="lazy" decoding="async" />
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
