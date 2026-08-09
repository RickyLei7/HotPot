import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "First-Time Hot Pot Calgary | What to Order & How It Works",
  description:
    "A practical first-time hot pot guide for Calgary: how individual hot pot works, what to order, AYCE details, soup bases, and how to reserve at Centre Street Japanese HotPot.",
  alternates: { canonical: "/first-time-hot-pot-calgary" },
  openGraph: {
    title: "First-Time Hot Pot Calgary | What to Order & How It Works",
    description:
      "New to hot pot? Learn how individual hot pot works, what to order, and how to reserve a table in Calgary.",
    url: "https://centrestjhotpot.ca/first-time-hot-pot-calgary/",
    images: ["/assets/dish-sukiyaki.webp"],
  },
};

const faqs = [
  [
    "How does individual hot pot work?",
    "Each guest chooses a personal soup base, then enjoys meats, vegetables, and rice or noodles cooked in the pot. Guests can also add snacks and drinks.",
  ],
  [
    "What should I order for my first hot pot visit?",
    "Start with a soup base you enjoy, choose a hot pot set or AYCE Hot Pot, then add meats, vegetables, rice or noodles, and a snack or milk tea if you like.",
  ],
  [
    "Does Centre Street Japanese HotPot have all-you-can-eat hot pot?",
    "Yes. AYCE Hot Pot is $28.99 + tax with soup base included. Meat is ordered through the server, the time limit is 1.5 hours, and a 19-item snack upgrade is available for +$3.99 per person when everyone at the table upgrades.",
  ],
  [
    "Is hot pot suitable for a group or a first-time guest?",
    "Yes. Individual hot pot lets each guest choose their own soup base and meal, which makes it practical for friends, families, groups, and first-time hot pot guests.",
  ],
  [
    "第一次吃火鍋要怎麼點？",
    "可以先選自己喜歡的湯底，再選火鍋套餐或火鍋自助，搭配肉品、蔬菜、飯或麵；想一起分享也可以加點台式小吃和奶茶。",
  ],
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://centrestjhotpot.ca/first-time-hot-pot-calgary/#article",
      headline: "First-Time Hot Pot in Calgary: What to Order and How It Works",
      description:
        "A practical guide to individual hot pot, first-time ordering, AYCE hot pot, soup bases, reservations, and location details at Centre Street Japanese HotPot in Calgary.",
      url: "https://centrestjhotpot.ca/first-time-hot-pot-calgary/",
      datePublished: "2026-08-08",
      dateModified: "2026-08-09",
      author: { "@id": "https://centrestjhotpot.ca/#restaurant" },
      about: [
        "first time hot pot Calgary",
        "how does hot pot work",
        "what to order at hot pot",
        "Calgary individual hot pot",
        "第一次吃火鍋",
      ],
      mainEntityOfPage: "https://centrestjhotpot.ca/first-time-hot-pot-calgary/",
      publisher: { "@id": "https://centrestjhotpot.ca/#restaurant" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://centrestjhotpot.ca/first-time-hot-pot-calgary/#faq",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

export default function FirstTimeHotPotCalgaryPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteNav />

      <section className="page-hero guide-page-hero">
        <div>
          <p className="eyebrow">First-time hot pot Calgary</p>
          <h1>New to Hot Pot? Here&apos;s How to Order in Calgary.</h1>
          <p className="hero-text">Individual hot pot is simple: choose your soup base, pick your meal, and make it your own with meats, vegetables, rice or noodles, snacks, and drinks.</p>
          <div className="hero-actions"><a className="primary-action" href="tel:+14034553188">Call (403) 455-3188 to Reserve</a><Link className="secondary-action" href="/menu">View Menu</Link></div>
        </div>
      </section>

      <section className="content-section">
        <div className="guide-layout">
          <article className="guide-copy">
            <p className="eyebrow">Quick answer</p>
            <h2>A first hot pot visit starts with your own soup base.</h2>
            <p>At Centre Street Japanese HotPot, each guest can enjoy a personal pot. Choose from 15 soup bases, then build your meal with meats, vegetables, rice or noodles. It is an easy format for different tastes at the same table.</p>
            <p>For a first visit, choose a Hot Pot Set for a straightforward meal or choose AYCE Hot Pot if your table wants an all-you-can-eat option. Add Taiwanese snacks or milk tea when you want more to share.</p>
          </article>
          <aside className="guide-card">
            <h2>First-visit facts</h2>
            <p><strong>Style:</strong> Taiwanese and Japanese-style individual hot pot</p>
            <p><strong>Soup bases:</strong> 15 choices</p>
            <p><strong>AYCE:</strong> $28.99 + tax, soup base included</p>
            <p><strong>Address:</strong> 2213 Centre St N #2243, Calgary, AB T2E 2T4</p>
            <p><strong>Reserve:</strong> <a href="tel:+14034553188">(403) 455-3188</a></p>
          </aside>
        </div>
      </section>

      <section className="weekly-picks">
        <div><p className="eyebrow">A simple order path</p><h2>Three easy choices for your first table.</h2></div>
        <div className="weekly-picks-grid">
          <article><img src="/assets/dish-sukiyaki-640.webp" srcSet="/assets/dish-sukiyaki-320.webp 320w, /assets/dish-sukiyaki-640.webp 640w, /assets/dish-sukiyaki.webp 1024w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Individual hot pot soup base at Centre Street Japanese HotPot in Calgary" width="900" height="675" loading="lazy" decoding="async" /><div><h3>1. Pick a soup base</h3><p>Choose a flavour that sounds good to you, then enjoy your own personal pot.</p></div></article>
          <article><img src="/assets/ayce-hotpot-menu-preview-360.webp" srcSet="/assets/ayce-hotpot-menu-preview-360.webp 360w, /assets/ayce-hotpot-menu-preview.webp 495w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="All-you-can-eat hot pot menu in Calgary" width="495" height="640" loading="lazy" decoding="async" /><div><h3>2. Choose your meal</h3><p>Pick a Hot Pot Set or AYCE Hot Pot, then order meats through your server for AYCE.</p></div></article>
          <article><img src="/assets/dish-popcorn-chicken-640.webp" srcSet="/assets/dish-popcorn-chicken-320.webp 320w, /assets/dish-popcorn-chicken-640.webp 640w, /assets/dish-popcorn-chicken.webp 1024w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Taiwanese fried chicken snack for a Calgary hot pot table" width="900" height="675" loading="lazy" decoding="async" /><div><h3>3. Add a shareable side</h3><p>Taiwanese snacks and milk tea are easy additions for friends and family tables.</p></div></article>
        </div>
      </section>

      <section className="content-section">
        <div className="faq-list">
          {faqs.map(([question, answer]) => <article key={question}><h2>{question}</h2><p>{answer}</p></article>)}
          <article><h2>Plan your visit</h2><p>See the <Link href="/calgary-hot-pot-guide">Calgary hot pot guide</Link>, read <Link href="/calgary-taiwanese-hot-pot">Taiwanese hot pot details</Link>, view the <Link href="/ayce-hot-pot-calgary">AYCE Hot Pot page</Link>, or call <a href="tel:+14034553188">(403) 455-3188</a> for today&apos;s availability.</p></article>
        </div>
      </section>
    </main>
  );
}
