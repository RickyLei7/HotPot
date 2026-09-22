import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "Calgary Hot Pot Guide | AYCE vs Personal Hot Pot",
  description:
    "Compare $28.99 AYCE and $19.99 personal hot pot in Calgary. See what each includes, choose from 15 soup bases, view the menu and book online.",
  alternates: {
    canonical: "/calgary-hot-pot-guide",
    languages: {
      "en-CA": "/calgary-hot-pot-guide/",
      "zh-Hant-CA": "/zh-hant/calgary-hot-pot-guide/",
      "x-default": "/calgary-hot-pot-guide/",
    },
  },
  openGraph: {
    title: "Calgary Hot Pot Guide | AYCE vs Personal Hot Pot",
    description:
      "Compare $28.99 AYCE and $19.99 personal hot pot, see what is included, and plan a Calgary hot pot visit on Centre Street.",
    url: "https://centrestjhotpot.ca/calgary-hot-pot-guide/",
    images: ["/assets/dish-sukiyaki.webp"],
  },
};

const guideFaqs = [
  [
    "What is the difference between AYCE and personal hot pot?",
    "AYCE is $28.99 + tax with soup base included and server-ordered meats. The $19.99 personal hot pot includes one soup base, a large vegetable set, one meat, and rice or noodles.",
  ],
  [
    "Which Calgary hot pot option should I choose?",
    "Choose personal hot pot for a complete set with your own soup and portions. Choose AYCE when you want to order more meat during the meal.",
  ],
  [
    "Is Centre Street Japanese HotPot good for group dining?",
    "Yes. The restaurant is suitable for friends gatherings, family meals, celebrations, and group dining. Call ahead for larger groups.",
  ],
  [
    "How do I reserve a table?",
    "Book online through the restaurant website. For group dining or today's table availability, call (403) 455-3188.",
  ],
];

const guideSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://centrestjhotpot.ca/calgary-hot-pot-guide/#article",
      headline: "Calgary Hot Pot Guide: AYCE vs Personal Hot Pot",
      description:
        "A practical Calgary guide comparing $28.99 AYCE and $19.99 personal hot pot, including what each option includes, soup bases, snacks, reservations, and location.",
      url: "https://centrestjhotpot.ca/calgary-hot-pot-guide/",
      datePublished: "2026-08-08",
      dateModified: "2026-09-22",
      author: { "@id": "https://centrestjhotpot.ca/#restaurant" },
      image: "https://centrestjhotpot.ca/assets/dish-sukiyaki.webp",
      inLanguage: "en-CA",
      about: [
        "Calgary hot pot guide",
        "AYCE vs personal hot pot Calgary",
        "Calgary individual hot pot",
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
      <SiteNav currentPath="/calgary-hot-pot-guide/" />

      <section className="page-hero guide-page-hero">
        <div>
          <p className="eyebrow">Calgary hot pot guide</p>
          <h1>Calgary Hot Pot Guide: AYCE vs Personal Hot Pot</h1>
          <p className="hero-text">
            Compare personal hot pot and AYCE, choose from 15 soup bases,
            and plan your visit on Centre Street.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="https://reservation.centrestjhotpot.ca/book" data-track-label="online_booking" aria-haspopup="dialog" data-reservation-launcher>
              Book Online
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
            <p className="eyebrow">Compare the two options</p>
            <h2>Compare $28.99 AYCE and $19.99 Personal Hot Pot</h2>
            <p>
              AYCE includes the soup base and lets you order AAA beef, lamb, pork, or chicken through your server during the meal.
            </p>
            <p>
              Personal hot pot is a complete set with one of 15 soup bases, a large vegetable set, one meat, and rice or noodles.
            </p>
          </article>
          <aside className="guide-card">
            <h2>Quick facts</h2>
            <p><strong>Restaurant:</strong> Centre Street Japanese HotPot</p>
            <p><strong>Style:</strong> Taiwanese and Japanese-style individual hot pot</p>
            <p><strong>Personal hot pot:</strong> $19.99</p>
            <p><strong>AYCE:</strong> $28.99 + tax, soup base included</p>
            <p><strong>Address:</strong> 2213 Centre St N #2243, Calgary, AB T2E 2T4</p>
            <p><strong>Reserve:</strong> <a href="https://reservation.centrestjhotpot.ca/book" data-track-label="online_booking" aria-haspopup="dialog" data-reservation-launcher>Book online</a> or <a href="tel:+14034553188">call (403) 455-3188</a></p>
          </aside>
        </div>
      </section>

      <section className="weekly-picks">
        <div>
          <p className="eyebrow">What to order</p>
          <h2>A Simple First Order</h2>
        </div>
        <div className="weekly-picks-grid">
          <article>
            <img src="/assets/dish-sukiyaki-640.webp" srcSet="/assets/dish-sukiyaki-320.webp 320w, /assets/dish-sukiyaki-640.webp 640w, /assets/dish-sukiyaki.webp 1024w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Sukiyaki hot pot soup base in Calgary" width="900" height="675" loading="lazy" decoding="async" />
            <div>
              <h3>Start with hot pot</h3>
              <p>Choose a soup base such as Sukiyaki, Spicy, Tomato, Miso, or Tom Yum Kung.</p>
            </div>
          </article>
          <article>
            <img src="/assets/dish-popcorn-chicken-640.webp" srcSet="/assets/dish-popcorn-chicken-320.webp 320w, /assets/dish-popcorn-chicken-640.webp 640w, /assets/dish-popcorn-chicken.webp 1024w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Taiwanese snack at Centre Street Japanese HotPot" width="900" height="675" loading="lazy" decoding="async" />
            <div>
              <h3>Add Taiwanese snacks</h3>
              <p>Pair the hot pot with fried chicken, takoyaki, spring rolls, or other shareable sides.</p>
            </div>
          </article>
          <article>
            <img src="/assets/milk-tea-photo-640.webp" srcSet="/assets/milk-tea-photo-320.webp 320w, /assets/milk-tea-photo-640.webp 640w, /assets/milk-tea-photo.webp 900w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Milk tea at Centre Street Japanese HotPot" width="900" height="1200" loading="lazy" decoding="async" />
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
              see the <Link href="/first-time-hot-pot-calgary">first-time hot pot guide</Link>,
              view the <Link href="/menu">menu</Link>, check <Link href="/contact">location and hours</Link>,
              or call <a href="tel:+14034553188">(403) 455-3188</a> to reserve a table.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
