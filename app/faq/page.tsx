import type { Metadata } from "next";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "FAQ | Centre Street Japanese HotPot Calgary",
  description:
    "Frequently asked questions about Centre Street Japanese HotPot and 鼎鑽火鍋 in Calgary, including reservations, Japanese hot pot, seafood options, group dining, location, soup bases, and AYCE updates.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ | Centre Street Japanese HotPot Calgary",
    description:
      "Frequently asked questions about Centre Street Japanese HotPot, 鼎鑽火鍋, Calgary hot pot, reservations, group dining, location, and soup bases.",
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
    "Yes. Centre Street Japanese HotPot offers Taiwanese and Japanese-style individual hot pot in Calgary with multiple soup bases, meats, vegetables, and customizable sides.",
  ],
  [
    "Do you offer Taiwanese hot pot?",
    "Yes. Centre Street Japanese HotPot serves Taiwanese hot pot and Japanese-style individual hot pot in Calgary. Taiwanese hot pot and Japanese hot pot share a similar personal hot pot dining style, with soup bases, meats, vegetables, rice or noodles, snacks, and drinks.",
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
    "What type of restaurant is Centre Street Japanese HotPot?",
    "Centre Street Japanese HotPot is a Taiwanese and Japanese-style hot pot restaurant in Calgary serving individual hot pot, soup bases, meats, seafood, vegetables, Taiwanese snacks, rice and noodle bowls, and milk tea.",
  ],
  [
    "Can I view the menu online?",
    "Yes. View our online menu for hot pot sets, soup bases, rice and noodles, appetizers, drinks, and full menu images.",
  ],
  [
    "Do you have combo sets?",
    "Yes. Centre Street Japanese HotPot offers a Solo Hot Pot Combo for $24.99 with 1 personal hot pot and 1 drink, and a Couple Hot Pot Combo for $58.99 with 2 personal hot pots, 2 drinks, and 1 appetizer. Prices are before tax.",
  ],
  [
    "Do you offer group dining?",
    "Yes. Centre Street Japanese HotPot is suitable for family dinners, friends, celebrations, and group dining. Please call ahead for larger groups.",
  ],
  [
    "Is All-You-Can-Eat Hot Pot available?",
    "Yes. All-You-Can-Eat Hot Pot is $28.99 + tax with soup base included. Meat is ordered through the server. Add 19 all-you-can-eat appetizers for +$3.99 per person; everyone at the same table must upgrade. Kids pricing is by height: under 100 cm free, 100-140 cm $12.99, and over 140 cm adult price. Time limit is 1.5 hours.",
  ],
  [
    "What soup bases do you offer?",
    "Soup base options include Sukiyaki, Tom Yum Kung, Spicy, Miso, Tomato, Satay, Kimchi, Curry, Pickled Cabbage, and more.",
  ],
  [
    "What is the Chinese name of Centre Street Japanese HotPot?",
    "The Chinese name of Centre Street Japanese HotPot is 鼎鑽火鍋.",
  ],
  [
    "Where can I eat hot pot in Calgary?",
    "Centre Street Japanese HotPot is a Calgary hot pot restaurant on Centre Street N, serving Taiwanese and Japanese-style individual hot pot, soup bases, meats, seafood, vegetables, Taiwanese snacks, rice and noodle bowls, and milk tea.",
  ],
  [
    "卡加利哪裡可以吃台式火鍋？",
    "鼎鑽火鍋 Centre Street Japanese HotPot 位於 2213 Centre St N #2243, Calgary, AB T2E 2T4，提供台式與日式風格的一人一鍋、多款湯底、肉類、海鮮、蔬菜、小吃、飯麵和奶茶。",
  ],
  [
    "Is Centre Street Japanese HotPot good for family or group dining?",
    "Yes. Centre Street Japanese HotPot is suitable for family dinners, friends, celebrations, and group dining. Please call ahead for larger groups or special occasions.",
  ],
  [
    "Why choose Centre Street Japanese HotPot for hot pot in Calgary?",
    "Centre Street Japanese HotPot is a good fit for Taiwanese and Japanese-style individual hot pot, multiple soup base choices, premium meats, seafood, Taiwanese snacks, milk tea, family meals, friends gatherings, and group dining in Calgary.",
  ],
  [
    "What should I order for a first visit?",
    "For a first visit, start with a personal hot pot set or the Solo Hot Pot Combo, choose a soup base such as Sukiyaki, Spicy, Tomato, Miso, or Tom Yum Kung, then add a Taiwanese snack and milk tea.",
  ],
  [
    "卡加利朋友聚餐火鍋推薦哪家？",
    "如果想找卡加利適合朋友聚餐、家庭聚餐或一人一鍋的火鍋，鼎鑽火鍋 Centre Street Japanese HotPot 提供台式與日式風格的一人一鍋、多款湯底、肉類海鮮、小吃、飯麵和奶茶。建議提前致電 (403) 455-3188 訂位。",
  ],
];

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
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
      <SiteNav />

      <section className="page-hero faq-page-hero">
        <div>
          <p className="eyebrow">FAQ</p>
          <h1>Frequently Asked Questions</h1>
          <p className="hero-text">
            Answers about reservations, Japanese hot pot, seafood options, group dining,
            and visiting Centre Street Japanese HotPot, also known as 鼎鑽火鍋, in Calgary.
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
