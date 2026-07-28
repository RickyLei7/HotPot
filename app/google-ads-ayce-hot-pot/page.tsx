import type { Metadata } from "next";
import Link from "next/link";

const mapsUrl =
  "https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z/data=!3m1!4b1!4m6!3m5!1s0x537165667f6ee1f3:0x1a418403f487f9b3!8m2!3d51.0722307!4d-114.0630498!16s%2Fg%2F11bwndz8pj";

export const metadata: Metadata = {
  title: "$28.99 AYCE Hot Pot Calgary | Centre Street Japanese HotPot",
  description:
    "Google Ads landing page for Centre Street Japanese HotPot AYCE Hot Pot in Calgary. $28.99 + tax, soup base included, 15 soup bases, snack upgrade, phone reservations, directions, and full menu.",
  alternates: {
    canonical: "/google-ads-ayce-hot-pot",
  },
  openGraph: {
    title: "$28.99 AYCE Hot Pot Calgary | Centre Street Japanese HotPot",
    description:
      "AYCE Hot Pot in Calgary for $28.99 + tax. Soup base included, 15 soup bases, snack upgrade, and phone reservations.",
    url: "https://centrestjhotpot.ca/google-ads-ayce-hot-pot/",
    images: ["/assets/ayce-hotpot-preview.webp"],
  },
};

const adsSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://centrestjhotpot.ca/google-ads-ayce-hot-pot/#webpage",
      url: "https://centrestjhotpot.ca/google-ads-ayce-hot-pot/",
      name: "$28.99 AYCE Hot Pot Calgary",
      description:
        "A focused Google Ads landing page for all-you-can-eat hot pot in Calgary at Centre Street Japanese HotPot.",
      about: [
        "AYCE hot pot Calgary",
        "all you can eat hot pot Calgary",
        "hot pot Calgary",
        "Calgary restaurant reservation",
      ],
      isPartOf: {
        "@id": "https://centrestjhotpot.ca/#website",
      },
      mainEntity: {
        "@id": "https://centrestjhotpot.ca/google-ads-ayce-hot-pot/#offer",
      },
    },
    {
      "@type": "Offer",
      "@id": "https://centrestjhotpot.ca/google-ads-ayce-hot-pot/#offer",
      name: "All-You-Can-Eat Hot Pot",
      price: "28.99",
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
      url: "https://centrestjhotpot.ca/google-ads-ayce-hot-pot/",
      description:
        "Soup base included. Meat ordered through the server. 1.5 hour limit. Price before tax.",
      seller: {
        "@id": "https://centrestjhotpot.ca/#restaurant",
      },
    },
    {
      "@type": "Restaurant",
      "@id": "https://centrestjhotpot.ca/#restaurant",
      name: "Centre Street Japanese HotPot",
      alternateName: ["鼎鑽火鍋", "Centre Street Japanese Hotpot"],
      telephone: "+1-403-455-3188",
      servesCuisine: ["Taiwanese Hot Pot", "Japanese-style Hot Pot", "Hot Pot"],
      address: {
        "@type": "PostalAddress",
        streetAddress: "2213 Centre St N #2243",
        addressLocality: "Calgary",
        addressRegion: "AB",
        postalCode: "T2E 2T4",
        addressCountry: "CA",
      },
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
    },
  ],
};

export default function GoogleAdsAyceHotPotPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(adsSchema) }}
      />
      <nav className="site-nav ads-nav" aria-label="Main navigation">
        <Link className="brand-mark" href="/" aria-label="Centre Street Japanese Hotpot home">
          <img src="/assets/brand-logo-wide.webp" alt="Centre Street Japanese Hotpot" width="600" height="184" />
        </Link>
        <div className="nav-links">
          <Link href="/menu">Menu</Link>
          <Link href="/ayce-hot-pot-calgary">AYCE Details</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <a className="nav-call" href="tel:+14034553188">
          Reserve
        </a>
      </nav>

      <section className="ads-hero">
        <div className="ads-hero-copy">
          <p className="eyebrow">AYCE Hot Pot Calgary · 卡加利火鍋自助 · Dine-in only</p>
          <h1>$28.99 AYCE Hot Pot in Calgary</h1>
          <p className="hero-text">
            Centre Street Japanese HotPot serves Taiwanese and Japanese-style all-you-can-eat hot pot
            with soup base included, 15 soup bases, server-ordered meats, and optional AYCE snacks.
            鼎鑽火鍋主打台式與日式風格火鍋自助，適合家庭聚餐、朋友聚會與團體訂位。
          </p>
          <div className="ads-hero-actions">
            <a className="primary-action" href="tel:+14034553188">
              Call (403) 455-3188 to Reserve
            </a>
            <a className="secondary-action" href={mapsUrl} target="_blank" rel="noreferrer">
              Get Directions
            </a>
            <Link className="secondary-action" href="/menu#ayce-hotpot">
              View Menu
            </Link>
          </div>
          <p className="ads-microcopy">2213 Centre St N #2243 · Mon-Fri 5 PM-10:30 PM · Sat-Sun 12 PM-10:30 PM</p>
        </div>
        <div className="ads-offer-card" aria-label="AYCE hot pot offer summary">
          <span className="ads-price">$28.99</span>
          <h2>Soup Base Included</h2>
          <ul>
            <li>15 soup bases · 15 款湯底</li>
            <li>AAA beef, lamb, pork, chicken · 肉類由服務員下單</li>
            <li>Snack upgrade +$3.99 · 小吃任點升級</li>
            <li>1.5 hour time limit · 限時 1.5 小時</li>
          </ul>
        </div>
      </section>

      <section className="ads-proof-strip" aria-label="Quick AYCE facts">
        <div><span>15</span>Soup Bases</div>
        <div><span>100g</span>Meat Servings</div>
        <div><span>+$3.99</span>AYCE Snacks</div>
        <div><span>Kids</span>Height Pricing</div>
      </section>

      <section className="ads-section ads-menu-summary">
        <div className="section-heading compact">
          <p className="eyebrow">What guests get</p>
          <h2>Everything needed to decide before calling. 訂位前先看重點。</h2>
        </div>
        <div className="ads-grid">
          <article>
            <h3>AYCE Hot Pot</h3>
            <p>$28.99 + tax. Soup base included. Meat is ordered through your server. 包含鍋底，價格未含稅。</p>
          </article>
          <article>
            <h3>Meat Selection</h3>
            <p>AAA beef, lamb, pork, and chicken. Each serving is 100g. 可選 AAA 牛肉、羊肉、豬肉與雞肉。</p>
          </article>
          <article>
            <h3>Snack Upgrade</h3>
            <p>+ $3.99 for AYCE snacks including Taiwanese fried chicken, takoyaki, crispy chicken cutlet, fried buns, and squid legs. 小吃任點需同桌升級。</p>
          </article>
          <article>
            <h3>Kids Pricing</h3>
            <p>Under 100 cm free. 100-140 cm $12.99. Over 140 cm adult price. 兒童按身高收費。</p>
          </article>
        </div>
      </section>

      <section className="ads-section ads-photo-band">
        <article>
          <img src="/assets/ayce-hotpot-preview.webp" alt="AYCE hot pot poster showing $28.99 price and soup base included" width="588" height="760" loading="lazy" decoding="async" />
          <div>
            <p className="eyebrow">AYCE details</p>
            <h2>Call before coming with a group. 團體用餐建議先致電。</h2>
            <p>For weekend tables, larger groups, or today&apos;s availability, calling is the fastest way to confirm a table. 週末、多人聚餐或想確認座位時，直接來電最快。</p>
            <div className="ads-hero-actions">
              <a className="primary-action" href="tel:+14034553188">Call to Reserve</a>
              <Link className="secondary-action dark" href="/ayce-hot-pot-calgary">
                Full AYCE Details
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
