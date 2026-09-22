import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "Taiwanese Food & Hot Pot Calgary | $28.99 AYCE",
  description:
    "Taiwanese food in Calgary: $19.99 personal hot pot, $28.99 AYCE, beef noodle soup, rice bowls, snacks and milk tea. View the menu and book online.",
  alternates: {
    canonical: "/calgary-taiwanese-hot-pot",
    languages: {
      "en-CA": "/calgary-taiwanese-hot-pot/",
      "zh-Hant-CA": "/zh-hant/calgary-taiwanese-hot-pot/",
      "x-default": "/calgary-taiwanese-hot-pot/",
    },
  },
  openGraph: {
    title: "Taiwanese Food & Hot Pot Calgary | $28.99 AYCE",
    description:
      "Choose personal hot pot or $28.99 AYCE, plus Taiwanese beef noodle soup, rice bowls, fried snacks and milk tea on Centre Street in Calgary.",
    url: "https://centrestjhotpot.ca/calgary-taiwanese-hot-pot/",
    images: ["/assets/dish-sukiyaki.webp"],
  },
};

const taiwaneseHotPotFaqs = [
  [
    "Where can I find Taiwanese hot pot in Calgary?",
    "Centre Street Japanese HotPot serves Taiwanese-style and Japanese-style individual hot pot at 2213 Centre St N #2243 in Calgary.",
  ],
  [
    "What Taiwanese food can I order besides hot pot?",
    "The menu includes Taiwanese beef noodle soup, braised pork rice, fried chicken with rice or noodles, wonton soup, fried snacks, milk tea, and other drinks.",
  ],
  [
    "How does personal hot pot work?",
    "The $19.99 personal hot pot includes one of 15 soup bases, a large vegetable set, one meat, and rice or noodles. Each guest can choose a different soup and spice level.",
  ],
  [
    "Does Centre Street Japanese HotPot offer all-you-can-eat hot pot?",
    "Yes. All-You-Can-Eat Hot Pot is available for $28.99 + tax, with soup base included, server-ordered meats, and an optional +$5.99 snack upgrade for the whole table.",
  ],
  [
    "How do I reserve a table?",
    "Book online through the restaurant website. For larger groups or today's table availability, call (403) 455-3188.",
  ],
];

const pageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://centrestjhotpot.ca/calgary-taiwanese-hot-pot/#article",
      headline: "Taiwanese Food & Hot Pot in Calgary",
      description:
        "Taiwanese food and hot pot in Calgary, including personal hot pot, AYCE, beef noodle soup, rice bowls, fried snacks, milk tea, and reservations.",
      url: "https://centrestjhotpot.ca/calgary-taiwanese-hot-pot/",
      datePublished: "2026-08-08",
      dateModified: "2026-09-22",
      author: { "@id": "https://centrestjhotpot.ca/#restaurant" },
      image: "https://centrestjhotpot.ca/assets/dish-sukiyaki.webp",
      inLanguage: "en-CA",
      about: [
        "Taiwanese hot pot Calgary",
        "Taiwanese individual hot pot Calgary",
        "Taiwanese food Calgary",
        "Taiwanese restaurant Calgary",
      ],
      mainEntityOfPage: "https://centrestjhotpot.ca/calgary-taiwanese-hot-pot/",
      publisher: {
        "@id": "https://centrestjhotpot.ca/#restaurant",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://centrestjhotpot.ca/calgary-taiwanese-hot-pot/#faq",
      mainEntity: taiwaneseHotPotFaqs.map(([question, answer]) => ({
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

export default function CalgaryTaiwaneseHotPotPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <SiteNav currentPath="/calgary-taiwanese-hot-pot/" />

      <section className="page-hero guide-page-hero">
        <div>
          <p className="eyebrow">Taiwanese food and hot pot in Calgary</p>
          <h1>Taiwanese Food & Hot Pot in Calgary</h1>
          <p className="hero-text">
            Choose $19.99 personal hot pot or $28.99 AYCE, or stop in for beef noodle soup, rice bowls, fried snacks, and milk tea.
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
            <p className="eyebrow">More than one way to eat</p>
            <h2>Hot Pot and Taiwanese Comfort Food</h2>
            <p>
              The $19.99 personal hot pot includes one of 15 soup bases, a large vegetable set,
              one meat, and rice or noodles. Personal pots let everyone choose a different flavour and spice level.
            </p>
            <p>
              If you do not want hot pot, choose Taiwanese beef noodle soup, braised pork rice,
              fried chicken with rice or noodles, wonton soup, fried snacks, or milk tea.
            </p>
          </article>
          <aside className="guide-card">
            <h2>Restaurant facts</h2>
            <p><strong>Name:</strong> Centre Street Japanese HotPot</p>
            <p><strong>Focus:</strong> Taiwanese-style and Japanese-style individual hot pot</p>
            <p><strong>Personal hot pot:</strong> $19.99</p>
            <p><strong>AYCE:</strong> $28.99 + tax, soup base included</p>
            <p><strong>Address:</strong> 2213 Centre St N #2243, Calgary, AB T2E 2T4</p>
            <p><strong>Reserve:</strong> <a href="https://reservation.centrestjhotpot.ca/book" data-track-label="online_booking" aria-haspopup="dialog" data-reservation-launcher>Book online</a> or <a href="tel:+14034553188">call (403) 455-3188</a></p>
          </aside>
        </div>
      </section>

      <section className="weekly-picks">
        <div>
          <p className="eyebrow">Build your meal</p>
          <h2>Choose a Pot Then Add a Side or Drink</h2>
        </div>
        <div className="weekly-picks-grid">
          <article>
            <img src="/assets/dish-sukiyaki-640.webp" srcSet="/assets/dish-sukiyaki-320.webp 320w, /assets/dish-sukiyaki-640.webp 640w, /assets/dish-sukiyaki.webp 1024w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Taiwanese-style individual hot pot in Calgary" width="900" height="675" loading="lazy" decoding="async" />
            <div>
              <h3>Choose a soup base</h3>
              <p>Pick from 15 soup bases, including spicy, sukiyaki, tomato, miso, and more.</p>
            </div>
          </article>
          <article>
            <img src="/assets/dish-popcorn-chicken-640.webp" srcSet="/assets/dish-popcorn-chicken-320.webp 320w, /assets/dish-popcorn-chicken-640.webp 640w, /assets/dish-popcorn-chicken.webp 1024w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Taiwanese fried chicken snack in Calgary" width="900" height="675" loading="lazy" decoding="async" />
            <div>
              <h3>Add Taiwanese snacks</h3>
              <p>Order fried chicken, takoyaki, crispy chicken cutlet, golden fried buns, and other sides.</p>
            </div>
          </article>
          <article>
            <img src="/assets/milk-tea-photo-640.webp" srcSet="/assets/milk-tea-photo-320.webp 320w, /assets/milk-tea-photo-640.webp 640w, /assets/milk-tea-photo.webp 900w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Milk tea with Taiwanese hot pot in Calgary" width="900" height="1200" loading="lazy" decoding="async" />
            <div>
              <h3>Order milk tea</h3>
              <p>Milk tea and drinks make the visit work for hot pot, snacks, and casual group dining.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="content-section">
        <div className="faq-list">
          {taiwaneseHotPotFaqs.map(([question, answer]) => (
            <article key={question}>
              <h2>{question}</h2>
              <p>{answer}</p>
            </article>
          ))}
          <article>
            <h2>Related pages</h2>
            <p>
              See the <Link href="/calgary-hot-pot-guide">Calgary hot pot guide</Link>,
              read the <Link href="/ayce-hot-pot-calgary">AYCE hot pot Calgary page</Link>,
              view the <Link href="/menu">menu</Link>, or check{" "}
              <Link href="/contact">location and hours</Link>.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
