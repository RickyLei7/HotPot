import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "Restaurant Information | Centre Street Japanese HotPot Calgary",
  description:
    "Calgary hot pot dining options: $28.99 AYCE, $19.99 personal hot pot, menu, hours, address and online booking at Centre Street Japanese HotPot.",
  alternates: {
    canonical: "/restaurant-info/",
    languages: {
      "en-CA": "/restaurant-info/",
      "zh-Hant-CA": "/zh-hant/restaurant-info/",
      "x-default": "/restaurant-info/",
    },
  },
  openGraph: {
    title: "Restaurant Information | Centre Street Japanese HotPot Calgary",
    description:
      "Calgary hot pot dining options: $28.99 AYCE, $19.99 personal hot pot, menu, hours, address and online booking at Centre Street Japanese HotPot.",
    url: "https://centrestjhotpot.ca/restaurant-info/",
    images: ["/assets/hero-beef-noodle.webp"],
  },
};

const restaurantInfoSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Centre Street Japanese HotPot Restaurant Information",
  url: "https://centrestjhotpot.ca/restaurant-info/",
  dateModified: "2026-11-05",
  about: {
    "@type": "Restaurant",
    "@id": "https://centrestjhotpot.ca/#restaurant",
    name: "Centre Street Japanese HotPot",
    alternateName: ["Centre Street Japanese Hotpot", "鼎鑽火鍋"],
    description:
      "Taiwanese and Japanese-style hot pot restaurant in Calgary serving individual hot pot, signature soup bases, premium meats, seafood, vegetables, Taiwanese snacks, rice and noodle bowls, and milk tea.",
    url: "https://centrestjhotpot.ca/",
    logo: "https://centrestjhotpot.ca/assets/brand-logo-wide.webp",
    image: [
      "https://centrestjhotpot.ca/assets/dish-spicy.webp",
      "https://centrestjhotpot.ca/assets/soup-lineup.webp",
      "https://centrestjhotpot.ca/assets/light-meals/fried-chicken-rice-noodle-1024.webp",
    ],
    inLanguage: ["en-CA", "zh-Hant-CA"],
    telephone: "+1-403-455-3188",
    email: "info@centrestjhotpot.ca",
    servesCuisine: ["Taiwanese Hot Pot", "Japanese-style Hot Pot", "Hot Pot", "Taiwanese", "Bubble Tea"],
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2213 Centre St N #2243",
      addressLocality: "Calgary",
      addressRegion: "AB",
      postalCode: "T2E 2T4",
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 51.0722307,
      longitude: -114.0630498,
    },
    hasMap:
      "https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z/data=!3m1!4b1!4m6!3m5!1s0x537165667f6ee1f3:0x1a418403f487f9b3!8m2!3d51.0722307!4d-114.0630498!16s%2Fg%2F11bwndz8pj",
    areaServed: { "@type": "City", name: "Calgary" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "17:00",
        closes: "22:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "12:00",
        closes: "22:30",
      },
    ],
    menu: "https://centrestjhotpot.ca/menu/",
    hasMenu: "https://centrestjhotpot.ca/menu/",
    acceptsReservations: true,
    sameAs: [
      "https://www.instagram.com/centrestreetjapanesehotpot/",
      "https://www.facebook.com/CentreStreetJapaneseHotPot",
      "https://www.threads.com/@centrestreetjapanesehotpot",
      "https://www.tiktok.com/@centrestjhotpot",
      "https://www.xiaohongshu.com/user/profile/65408e340000000030030828",
    ],
  },
};

const facts = [
  ["Name", "Centre Street Japanese HotPot."],
  [
    "Restaurant Type",
    "Taiwanese and Japanese-style hot pot restaurant in Calgary serving individual hot pot, soup bases, meats, seafood, vegetables, Taiwanese snacks, rice and noodle bowls, and milk tea.",
  ],
  ["All-You-Can-Eat Hot Pot", "$28.99 per adult, with one of 15 soup bases included. Choose AAA beef, lamb, pork or chicken and order meat through your server."],
  ["Personal Hot Pot", "$19.99 includes one soup base, a large vegetable set, one meat and one rice or noodle side."],
  ["19 AYCE Snacks Upgrade", "Add 19 all-you-can-eat snacks for +$5.99 per person. Everyone at the same table must take the upgrade."],
  ["Hot Pot Combos", "The $24.99 Solo Combo includes one personal hot pot and one drink. The $58.99 Couple Combo includes two personal hot pots, two drinks and one appetizer."],
  ["Address", "2213 Centre St N #2243, Calgary, AB T2E 2T4, Canada."],
  [
    "Contact",
    "Book online for reservations. Phone: (403) 455-3188. Email: info@centrestjhotpot.ca. Call for group dining and today's table availability.",
  ],
  ["Hours", "Monday to Friday: 17:00-22:30. Saturday and Sunday: 12:00-22:30."],
  [
    "Menu Categories",
    "Hot pot set, combo specials, soup bases, rice and noodles, appetizers, Taiwanese snacks, milk tea and drinks, and full in-store menu images.",
  ],
  [
    "Good For",
    "Personal hot pot, AYCE, family meals, group dining, Taiwanese snacks, and milk tea in Calgary.",
  ],
];

export default function RestaurantInfoPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantInfoSchema) }}
      />
      <SiteNav currentPath="/restaurant-info/" />

      <section className="page-hero contact-page-hero">
        <div>
          <p className="eyebrow">Restaurant Information</p>
          <h1>Centre Street Japanese HotPot in Calgary</h1>
          <p className="hero-text">
            Address, hours, menu highlights, prices, and reservation options in one place.
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="faq-list">
          {facts.map(([title, body]) => (
            <article key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
          <article>
            <h2>Official Links</h2>
            <p>
              <Link href="/">Home</Link> · <Link href="/menu">Menu</Link> ·{" "}
              <Link href="/about">About</Link> · <Link href="/faq">FAQ</Link> ·{" "}
              <Link href="/contact">Contact</Link> ·{" "}
              <Link href="/ayce-hot-pot-calgary">AYCE Hot Pot</Link> ·{" "}
              <Link href="/calgary-hot-pot-guide">Calgary hot pot guide</Link> ·{" "}
              <Link href="/calgary-taiwanese-hot-pot">Taiwanese hot pot guide</Link> ·{" "}
              <a href="/llms.txt">AI-readable facts</a>
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
