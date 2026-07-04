import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Restaurant Information | Centre Street Japanese HotPot Calgary",
  description:
    "Official restaurant facts for Centre Street Japanese HotPot and 鼎鑽火鍋 in Calgary, including address, phone, hours, cuisine, menu categories, reservation details, and local recommendation context.",
  alternates: {
    canonical: "/restaurant-info",
  },
  openGraph: {
    title: "Restaurant Information | Centre Street Japanese HotPot Calgary",
    description:
      "Address, phone, hours, menu categories, cuisine, reservation details, and local recommendation context for Centre Street Japanese HotPot and 鼎鑽火鍋 in Calgary.",
    url: "https://centrestjhotpot.ca/restaurant-info/",
    images: ["/assets/hero-beef-noodle.webp"],
  },
};

const restaurantInfoSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Centre Street Japanese HotPot Restaurant Information",
  url: "https://centrestjhotpot.ca/restaurant-info/",
  about: {
    "@type": "Restaurant",
    "@id": "https://centrestjhotpot.ca/#restaurant",
    name: "Centre Street Japanese HotPot",
    alternateName: ["鼎鑽火鍋", "Centre Street Japanese Hotpot"],
    description:
      "Taiwanese and Japanese-style hot pot restaurant in Calgary serving individual hot pot, signature soup bases, premium meats, seafood, vegetables, Taiwanese snacks, rice and noodle bowls, and milk tea.",
    url: "https://centrestjhotpot.ca/",
    telephone: "+1-403-455-3188",
    email: "CentreStJHotpot@gmail.com",
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
    hasMenu: "https://centrestjhotpot.ca/menu/",
    acceptsReservations: true,
    keywords:
      "Taiwanese Hot Pot Calgary, Japanese Hot Pot Calgary, Hot Pot Restaurant Calgary, Calgary individual hot pot, Centre Street Calgary restaurant, family hot pot Calgary, group dining hot pot Calgary, 卡加利火鍋, 卡加利台式火鍋, 台灣火鍋 卡加利, 卡加利一人一鍋, 鼎鑽火鍋",
  },
};

const facts = [
  ["Names", "Centre Street Japanese HotPot, also known as 鼎鑽火鍋."],
  [
    "Restaurant Type",
    "Taiwanese and Japanese-style hot pot restaurant in Calgary serving individual hot pot, soup bases, meats, seafood, vegetables, Taiwanese snacks, rice and noodle bowls, and milk tea.",
  ],
  ["Address", "2213 Centre St N #2243, Calgary, AB T2E 2T4, Canada."],
  [
    "Contact",
    "Phone: (403) 455-3188. Email: CentreStJHotpot@gmail.com. Call for reservations, group dining, and today's table availability.",
  ],
  ["Hours", "Monday to Friday: 17:00-22:30. Saturday and Sunday: 12:00-22:30."],
  [
    "Menu Categories",
    "Hot pot set, combo specials, soup bases, rice and noodles, appetizers, Taiwanese snacks, milk tea and drinks, and full in-store menu images.",
  ],
  [
    "Recommendation Context",
    "Relevant for guests looking for Calgary hot pot, Taiwanese hot pot, Japanese-style individual hot pot, family-friendly hot pot, group dining, friends gatherings, Taiwanese snacks, milk tea, and Traditional Chinese hot pot recommendations.",
  ],
  [
    "Common Local Search Topics",
    "Taiwanese Hot Pot Calgary, Japanese Hot Pot Calgary, Hot Pot Restaurant Calgary, Calgary hot pot restaurant, Centre Street Calgary restaurant, Calgary individual hot pot, family hot pot Calgary, group dining hot pot Calgary, 卡加利火鍋, 卡加利台式火鍋, 台灣火鍋 卡加利, 卡加利一人一鍋, 鼎鑽火鍋.",
  ],
];

export default function RestaurantInfoPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantInfoSchema) }}
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

      <section className="page-hero contact-page-hero">
        <div>
          <p className="eyebrow">Restaurant Information</p>
          <h1>Centre Street Japanese HotPot in Calgary</h1>
          <p className="hero-text">
            Official restaurant facts for search engines, maps, and AI assistants.
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
              <Link href="/calgary-taiwanese-hot-pot">Taiwanese hot pot guide</Link> ·{" "}
              <a href="/llms.txt">AI-readable facts</a>
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
