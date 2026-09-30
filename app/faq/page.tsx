import type { Metadata } from "next";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "Calgary Hot Pot FAQ | Prices, Hours & Online Booking",
  description:
    "Plan your visit to Centre Street Japanese HotPot: $28.99 AYCE, $19.99 personal hot pot, kids prices, soup bases, hours, directions and online booking.",
  alternates: {
    canonical: "/faq",
    languages: {
      "en-CA": "/faq/",
      "zh-Hant-CA": "/zh-hant/faq/",
      "x-default": "/faq/",
    },
  },
  openGraph: {
    title: "Calgary Hot Pot FAQ | Prices, Hours & Online Booking",
    description:
      "Plan your visit to Centre Street Japanese HotPot: $28.99 AYCE, $19.99 personal hot pot, kids prices, soup bases, hours, directions and online booking.",
    url: "https://centrestjhotpot.ca/faq/",
    images: ["/assets/snack-lineup.webp"],
  },
};

const faqs = [
  [
    "How much is all-you-can-eat hot pot in Calgary?",
    "AYCE hot pot is $28.99 per person plus tax. Choose from 15 soup bases; soup base is included. Order AAA beef, lamb, pork or chicken through your server.",
    "/ayce-hot-pot-calgary/",
    "See AYCE details"
  ],
  [
    "How much is personal hot pot?",
    "Personal hot pot is $19.99 plus tax. It includes one soup base, a large vegetable set, one meat and one rice or noodle side.",
    "/menu/#hotpot-set",
    "View personal hot pot"
  ],
  [
    "What does the $5.99 snack upgrade include?",
    "Add 19 all-you-can-eat snacks for $5.99 plus tax per person. Everyone at the same table must upgrade. Choices include Taiwanese fried chicken, takoyaki and golden fried buns.",
    "/ayce-hot-pot-calgary/#ayce-snacks",
    "See all 19 snacks"
  ],
  [
    "How much is AYCE for children?",
    "Children under 100 cm eat free. Children 100–140 cm are $12.99 plus tax. Over 140 cm, the adult price applies.",
    "/ayce-hot-pot-calgary/",
    "View AYCE pricing"
  ],
  [
    "How do I book a table?",
    "Book online through our website. For larger groups or questions about today’s availability, call (403) 455-3188.",
    "https://reservation.centrestjhotpot.ca/book",
    "Book Online"
  ],
  [
    "What are your opening hours?",
    "Monday–Friday: 5:00–10:30 PM. Saturday–Sunday: noon–10:30 PM.",
    "/contact/",
    "Location and hours"
  ],
  [
    "Where is Centre Street Japanese HotPot?",
    "Find us at 2213 Centre St N #2243, Calgary, AB T2E 2T4.",
    "/contact/",
    "Get directions"
  ],
  [
    "What soup bases can I choose?",
    "Choose from 15 soup bases, including Sukiyaki, Tomato, Miso, Spicy and Tom Yum Kung. Each guest can choose their own soup base.",
    "/menu/#soup-bases",
    "View soup bases"
  ],
  [
    "Do you have solo and couple combos?",
    "The $24.99 Solo Combo includes one personal hot pot and one drink. The $58.99 Couple Combo includes two personal hot pots, two drinks and one appetizer. Prices are before tax.",
    "/menu/#combo-specials",
    "View combos"
  ],
  [
    "What should I order on my first visit?",
    "Choose the $19.99 personal hot pot for a complete set, or $28.99 AYCE if you want to order more meat. Then choose your soup base. Prices are before tax.",
    "/first-time-hot-pot-calgary/",
    "Read the first-visit guide"
  ]
];

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    dateModified: "2026-09-29",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteNav currentPath="/faq/" />

      <section className="page-hero faq-page-hero">
        <div>
          <p className="eyebrow">FAQ</p>
          <h1>Hot Pot Reservations & Visit FAQs</h1>
          <p className="hero-text">
            Quick answers about the menu, reservations, groups, hours, and location.
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="faq-list">
          {faqs.map(([question, answer, href, label]) => (
            <article key={question}>
              <h2>{question}</h2>
              <p>{answer}</p>
              <a className="card-action" href={href} {...(href.startsWith("https://reservation.") ? { "data-track-label": "online_booking", "aria-haspopup": "dialog" as const, "data-reservation-launcher": true } : {})}>{label}</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
