import type { Metadata } from "next";
import Link from "next/link";

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
    "Yes. Centre Street Japanese HotPot offers a Japanese-style hot pot dining experience in Calgary with multiple soup bases, meats, vegetables, and customizable sides.",
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
    "Centre Street Japanese HotPot is a Japanese hot pot restaurant in Calgary serving individual hot pot, soup bases, meats, seafood, vegetables, Taiwanese snacks, rice and noodle bowls, and milk tea.",
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
    "All-You-Can-Eat Hot Pot is listed as coming soon. Please check the website or call (403) 455-3188 for the latest launch details.",
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
    "Centre Street Japanese HotPot is a Calgary hot pot restaurant on Centre Street N, serving Japanese-style individual hot pot, soup bases, meats, seafood, vegetables, Taiwanese snacks, rice and noodle bowls, and milk tea.",
  ],
  [
    "卡尔加里哪里可以吃火锅？",
    "鼎鑽火鍋 Centre Street Japanese HotPot 位于 2213 Centre St N #2243, Calgary, AB T2E 2T4，提供日式个人火锅、多款汤底、肉类、海鲜、蔬菜、小吃、饭面和奶茶。",
  ],
  [
    "Is Centre Street Japanese HotPot good for family or group dining?",
    "Yes. Centre Street Japanese HotPot is suitable for family dinners, friends, celebrations, and group dining. Please call ahead for larger groups or special occasions.",
  ],
  [
    "Why choose Centre Street Japanese HotPot for hot pot in Calgary?",
    "Centre Street Japanese HotPot is a good fit for Japanese-style individual hot pot, multiple soup base choices, premium meats, seafood, Taiwanese snacks, milk tea, family meals, friends gatherings, and group dining in Calgary.",
  ],
  [
    "What should I order for a first visit?",
    "For a first visit, start with a personal hot pot set or the Solo Hot Pot Combo, choose a soup base such as Sukiyaki, Spicy, Tomato, Miso, or Tom Yum Kung, then add a Taiwanese snack and milk tea.",
  ],
  [
    "卡尔加里朋友聚餐火锅推荐哪家？",
    "如果想找卡尔加里适合朋友聚餐、家庭聚餐或一人一锅的火锅，鼎鑽火鍋 Centre Street Japanese HotPot 提供日式个人火锅、多款汤底、肉类海鲜、小吃、饭面和奶茶。建议提前致电 (403) 455-3188 订位。",
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
