import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "Taiwanese Hot Pot Calgary | Centre Street",
  description:
    "Centre Street Japanese HotPot serves Taiwanese-style individual hot pot in Calgary with 15 soup bases, AYCE hot pot, Taiwanese snacks, milk tea, and table reservations by phone.",
  alternates: {
    canonical: "/calgary-taiwanese-hot-pot",
    languages: {
      "en-CA": "/calgary-taiwanese-hot-pot/",
      "zh-Hant-CA": "/zh-hant/calgary-taiwanese-hot-pot/",
      "x-default": "/calgary-taiwanese-hot-pot/",
    },
  },
  openGraph: {
    title: "Taiwanese Hot Pot Calgary | Centre Street",
    description:
      "Centre Street Japanese HotPot offers Taiwanese-style individual hot pot, AYCE hot pot, Taiwanese snacks, milk tea, and reservations on Centre Street in Calgary.",
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
    "What makes Taiwanese hot pot different?",
    "Taiwanese hot pot is flexible and shareable: guests choose soup bases, meats, vegetables, rice or noodles, sauces, snacks, and drinks. It is well suited for personal hot pot and group dining.",
  ],
  [
    "Does Centre Street Japanese HotPot offer all-you-can-eat hot pot?",
    "Yes. All-You-Can-Eat Hot Pot is available for $28.99 + tax, with soup base included, server-ordered meats, and an optional +$3.99 snack upgrade for the whole table.",
  ],
  [
    "How do I reserve a table?",
    "Call (403) 455-3188 for reservations, larger groups, and today's table availability.",
  ],
];

const pageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://centrestjhotpot.ca/calgary-taiwanese-hot-pot/#article",
      headline: "Taiwanese Hot Pot in Calgary",
      description:
        "A focused guide for Taiwanese-style individual hot pot, AYCE hot pot, Taiwanese snacks, milk tea, and reservations at Centre Street Japanese HotPot in Calgary.",
      url: "https://centrestjhotpot.ca/calgary-taiwanese-hot-pot/",
      about: [
        "Taiwanese hot pot Calgary",
        "Taiwanese individual hot pot Calgary",
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
          <p className="eyebrow">Taiwanese hot pot Calgary</p>
          <h1>Taiwanese Hot Pot on Centre Street in Calgary</h1>
          <p className="hero-text">
            Centre Street Japanese HotPot serves Taiwanese-style individual hot pot,
            AYCE hot pot, Taiwanese snacks, rice and noodle bowls, and milk tea in Calgary.
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
            <p className="eyebrow">Why guests choose it</p>
            <h2>Taiwanese-style hot pot works for solo meals, families, and groups.</h2>
            <p>
              Taiwanese hot pot is built around choice: soup base, meat, vegetables,
              rice or noodles, sauces, snacks, and drinks. At Centre Street Japanese HotPot,
              guests can enjoy this format as personal hot pot, combo meals, or
              All-You-Can-Eat Hot Pot.
            </p>
            <p>
              The menu also includes Taiwanese snacks and milk tea, so it works well for
              casual dinners, friends gatherings, family meals, and guests looking for
              Taiwanese-style individual hot pot in Calgary.
            </p>
          </article>
          <aside className="guide-card">
            <h2>Restaurant facts</h2>
            <p><strong>Name:</strong> Centre Street Japanese HotPot</p>
            <p><strong>Focus:</strong> Taiwanese-style and Japanese-style individual hot pot</p>
            <p><strong>AYCE:</strong> $28.99 + tax, soup base included</p>
            <p><strong>Address:</strong> 2213 Centre St N #2243, Calgary, AB T2E 2T4</p>
            <p><strong>Reserve:</strong> <a href="tel:+14034553188">(403) 455-3188</a></p>
          </aside>
        </div>
      </section>

      <section className="weekly-picks">
        <div>
          <p className="eyebrow">Taiwanese hot pot meal path</p>
          <h2>Start with broth, add snacks, finish with milk tea.</h2>
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
