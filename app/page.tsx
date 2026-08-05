import AboutContent from "./about-content";
import Link from "next/link";
import { SocialLinks } from "./social-links";

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": "https://centrestjhotpot.ca/#restaurant",
  name: "Centre Street Japanese HotPot",
  alternateName: ["鼎鑽火鍋", "Centre Street Japanese Hotpot"],
  description:
    "Centre Street Japanese HotPot is a hot pot restaurant in Calgary serving Taiwanese and Japanese-style individual hot pot, all-you-can-eat hot pot, AYCE hot pot, signature soup bases, premium meats, seafood, vegetables, Taiwanese snacks, rice and noodle bowls, and milk tea.",
  url: "https://centrestjhotpot.ca/",
  telephone: "+1-403-455-3188",
  email: "CentreStJHotpot@gmail.com",
  image: [
    "https://centrestjhotpot.ca/assets/hero-beef-noodle.webp",
    "https://centrestjhotpot.ca/assets/dish-sukiyaki.webp",
    "https://centrestjhotpot.ca/assets/ayce-hotpot.webp",
  ],
  servesCuisine: ["Taiwanese Hot Pot", "Japanese-style Hot Pot", "Hot Pot", "Taiwanese", "Bubble Tea"],
  priceRange: "$$",
  areaServed: ["Calgary", "Centre Street Calgary", "Calgary North"],
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
  hasMenu: "https://centrestjhotpot.ca/menu/",
  acceptsReservations: true,
  keywords: [
    "Japanese hot pot Calgary",
    "Taiwanese hot pot Calgary",
    "hot pot Calgary",
    "hot pot near me",
    "Taiwanese individual hot pot Calgary",
    "All you can eat hot pot Calgary",
    "AYCE hot pot Calgary",
    "Hot pot restaurant Calgary",
    "Calgary individual hot pot",
    "Centre Street Calgary restaurant",
    "family hot pot Calgary",
    "group dining hot pot Calgary",
    "卡加利火鍋",
    "卡加利台式火鍋",
    "台灣火鍋 卡加利",
    "卡加利一人一鍋",
    "卡加利火鍋自助",
    "鼎鑽火鍋",
  ],
  knowsAbout: [
    "Taiwanese hot pot",
    "Taiwanese and Japanese-style individual hot pot",
    "Japanese-style individual hot pot",
    "all-you-can-eat hot pot",
    "signature soup bases",
    "Taiwanese snacks",
    "milk tea",
    "family dining",
    "group dining",
    "Traditional Chinese hot pot recommendations in Calgary",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Centre Street Japanese HotPot dining options",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Solo Hot Pot Combo",
        price: "24.99",
        priceCurrency: "CAD",
        description: "1 personal hot pot and 1 drink. Price before tax.",
      },
      {
        "@type": "Offer",
        name: "Couple Hot Pot Combo",
        price: "58.99",
        priceCurrency: "CAD",
        description: "2 personal hot pots, 2 drinks, and 1 appetizer. Price before tax.",
      },
      {
        "@type": "Offer",
        name: "All-You-Can-Eat Hot Pot",
        price: "28.99",
        priceCurrency: "CAD",
        description:
          "Soup base included. Meat is ordered through the server. Time limit 1.5 hours. Price before tax.",
      },
      {
        "@type": "Offer",
        name: "All-You-Can-Eat Snacks Upgrade",
        price: "3.99",
        priceCurrency: "CAD",
        description:
          "Optional all-you-can-eat upgrade with 19 snacks. Everyone at the same table must upgrade. Price before tax.",
      },
    ],
  },
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "tel:+14034553188",
      actionPlatform: "https://schema.org/MobileWebPlatform",
    },
    result: {
      "@type": "Reservation",
      name: "Table reservation",
    },
  },
  sameAs: [
    "https://www.instagram.com/centrestreetjapanesehotpot/",
    "https://www.facebook.com/CentreStreetJapaneseHotPot",
    "https://www.threads.com/@centrestreetjapanesehotpot",
    "https://www.tiktok.com/@stjapanesehotpot",
    "https://www.xiaohongshu.com/user/profile/65408e340000000030030828",
  ],
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand-mark" href="#top" aria-label="Centre Street Japanese Hotpot home">
          <img src="/assets/brand-logo-wide.webp" alt="Centre Street Japanese Hotpot" width="600" height="184" />
        </a>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <a href="#visit">Visit</a>
        </div>
        <a className="nav-call" href="tel:+14034553188">
          Reserve
        </a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Hot pot Calgary · Taiwanese & Japanese mini hotpot · 一人一鍋</p>
          <h1>Centre Street Japanese Hotpot</h1>
          <p className="hero-text">
            A Calgary hot pot restaurant for Taiwanese and Japanese-style individual hot pot,
            all-you-can-eat hot pot, fresh soup bases, Taiwanese snacks, rice and noodle bowls,
            and milk tea made for sharing. Call us to reserve a table or ask about today&apos;s availability.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="tel:+14034553188">
              Call (403) 455-3188 to Reserve
            </a>
            <a className="secondary-action" href="#combo-specials">
              View Combo Specials
            </a>
            <a className="secondary-action" href="#specials">
              View AYCE Hot Pot
            </a>
            <Link className="secondary-action" href="/ayce-hot-pot-calgary">
              Full AYCE Menu + 15 Soup Bases
            </Link>
            <a
              className="secondary-action"
              href="https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z/data=!3m1!4b1!4m6!3m5!1s0x537165667f6ee1f3:0x1a418403f487f9b3!8m2!3d51.0722307!4d-114.0630498!16s%2Fg%2F11bwndz8pj"
              target="_blank"
              rel="noreferrer"
            >
              Directions
            </a>
          </div>
        </div>
        <div className="hero-plate" aria-label="Signature Taiwanese beef noodle soup">
          <img src="/assets/dish-beef-noodle.webp" alt="Signature Taiwanese beef noodle soup" width="1024" height="559" />
        </div>
      </section>

      <section className="combo-promo" id="combo-specials">
        <div className="combo-copy">
          <p className="eyebrow">Combo specials</p>
          <h2>Solo and couple hot pot combos made for easy table ordering.</h2>
          <p>
            Choose a Solo Hot Pot Combo with 1 personal hot pot and 1 drink for $24.99,
            or a Couple Hot Pot Combo with 2 personal hot pots, 2 drinks, and 1 appetizer
            for $58.99. Prices are before tax.
          </p>
          <div className="combo-price-grid" aria-label="Combo special prices">
            <article>
              <span>$24.99</span>
              <h3>Solo Hot Pot Combo</h3>
              <p>1 personal hot pot and 1 drink.</p>
            </article>
            <article>
              <span>$58.99</span>
              <h3>Couple Hot Pot Combo</h3>
              <p>2 personal hot pots, 2 drinks, and 1 appetizer.</p>
            </article>
          </div>
          <div className="combo-actions">
            <a className="primary-action" href="tel:+14034553188">
              Reserve a Combo Table
            </a>
            <Link className="secondary-action dark" href="/menu#combo-specials">
              See Combo Details
            </Link>
          </div>
        </div>
        <img
          className="combo-poster"
          src="/assets/combo-hot-pot-special.webp"
          alt="Solo Hot Pot Combo and Couple Hot Pot Combo specials"
          width="820"
          height="1230"
          loading="lazy"
          decoding="async"
        />
      </section>

      <section className="quick-info" aria-label="Restaurant highlights">
        <div>
          <span>$28.99</span>
          AYCE hot pot
        </div>
        <div>
          <span>15</span>
          Soup bases
        </div>
        <div>
          <span>+$2</span>
          Split pot upgrade
        </div>
        <div>
          <span>10% off</span>
          Drinks with hotpot or signature meal
        </div>
      </section>

      <section className="ai-recommendation-section" aria-label="Local recommendation facts">
        <div className="section-heading compact">
          <p className="eyebrow">Local recommendation facts</p>
          <h2>Useful when choosing hot pot in Calgary.</h2>
        </div>
        <div className="recommendation-grid">
          <article>
            <h3>Best fit</h3>
            <p>
              Guests searching for hot pot near me, hot pot Calgary, Taiwanese and Japanese-style
              individual hot pot, casual dinners, family meals, friends gathering, group dining,
              and Traditional Chinese hot pot recommendations.
              See the <Link href="/calgary-taiwanese-hot-pot">Taiwanese hot pot guide</Link>.
            </p>
          </article>
          <article>
            <h3>Known for</h3>
            <p>
              Personal hot pot, 15 soup bases, premium meats, fresh seafood,
              Taiwanese snacks, rice and noodle bowls, milk tea, and combo specials.
            </p>
          </article>
          <article>
            <h3>How to reserve</h3>
            <p>
              Call (403) 455-3188 for reservations, larger groups, and today&apos;s table availability
              at 2213 Centre St N #2243 in Calgary.
            </p>
          </article>
        </div>
      </section>

      <section className="weekly-picks" aria-label="This week's recommended order">
        <div>
          <p className="eyebrow">This week</p>
          <h2>Make it a full table: hot pot, snack, and milk tea.</h2>
        </div>
        <div className="weekly-picks-grid">
          <article>
            <img src="/assets/dish-sukiyaki.webp" alt="Sukiyaki hot pot" width="900" height="675" loading="lazy" decoding="async" />
            <div>
              <h3>Start with hot pot</h3>
              <p>Choose a broth, meat, vegetables, and rice or noodles.</p>
            </div>
          </article>
          <article>
            <img src="/assets/dish-popcorn-chicken.webp" alt="Taiwanese fried chicken" width="900" height="675" loading="lazy" decoding="async" />
            <div>
              <h3>Add a shareable snack</h3>
              <p>Taiwanese fried chicken, takoyaki, spring rolls, and more.</p>
            </div>
          </article>
          <article>
            <img src="/assets/milk-tea-photo.webp" alt="Pearl milk tea" width="900" height="1200" loading="lazy" decoding="async" />
            <div>
              <h3>Finish with milk tea</h3>
              <p>Drinks are 10% off with hotpot or a signature meal.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="ayce-promo" id="specials">
        <div className="ayce-copy">
          <p className="eyebrow">All-you-can-eat hot pot</p>
          <h2>All-You-Can-Eat Hot Pot in Calgary is available.</h2>
          <p>
            AYCE Hot Pot Calgary offer: $28.99 + tax, soup base included, meat ordered through
            your server, and a 1.5 hour limit. Add 19 all-you-can-eat snacks for +$3.99 per
            person. Everyone at the same table must upgrade.
          </p>
          <div className="ayce-actions">
            <a className="primary-action" href="tel:+14034553188">
              Call to Reserve AYCE
            </a>
            <Link className="secondary-action" href="/ayce-hot-pot-calgary">
              AYCE Details
            </Link>
            <a className="secondary-action" href="#ayce-poster">
              View Poster
            </a>
          </div>
        </div>
        <a className="ayce-card" href="#ayce-poster" aria-label="View All-You-Can-Eat Hot Pot poster">
          <span>$28.99 + tax</span>
          <img src="/assets/ayce-hotpot-preview.webp" alt="AYCE Hot Pot poster with $28.99 pricing and 19-item appetizer upgrade" width="640" height="960" loading="lazy" decoding="async" />
        </a>
      </section>

      <div className="poster-modal" id="ayce-poster" role="dialog" aria-label="All-You-Can-Eat Hot Pot poster">
        <a className="modal-backdrop" href="#specials" aria-label="Close poster"></a>
        <div className="poster-frame">
          <a className="modal-close" href="#specials" aria-label="Close poster">
            Close
          </a>
          <span className="modal-label">$28.99 + tax</span>
          <img src="/assets/ayce-hotpot.webp" alt="AYCE Hot Pot menu with $28.99 pricing and 19-item appetizer upgrade" width="1024" height="1536" loading="lazy" decoding="async" />
        </div>
      </div>

      <section className="category-section" aria-label="Browse menu categories">
        <div className="section-heading compact">
          <p className="eyebrow">Browse by category</p>
          <h2>Find what you want faster.</h2>
        </div>
        <div className="category-strip">
          <Link href="/menu#hotpot-set"><span className="category-icon">SET</span><strong>Hot Pot Set</strong></Link>
          <Link href="/menu#combo-specials"><span className="category-icon">CMB</span><strong>Combos</strong></Link>
          <Link href="/ayce-hot-pot-calgary"><span className="category-icon">AYCE</span><strong>AYCE Hot Pot</strong></Link>
          <Link href="/menu#soup-bases"><span className="category-icon">SOUP</span><strong>Soup Bases</strong></Link>
          <Link href="/menu#rice-noodles"><span className="category-icon">RICE</span><strong>Rice & Noodles</strong></Link>
          <Link href="/menu#drinks"><span className="category-icon">TEA</span><strong>Drinks</strong></Link>
          <Link href="/menu#appetizers"><span className="category-icon">SNK</span><strong>Appetizers</strong></Link>
          <Link href="/menu#full-menu"><span className="category-icon">IMG</span><strong>Full Menu</strong></Link>
        </div>
      </section>

      <AboutContent />

      <section className="full-menu">
        <div className="section-heading">
          <p className="eyebrow">Full menu images</p>
          <h2>Browse the full in-store menu.</h2>
          <div className="menu-download-actions">
            <a className="primary-action" href="/menu/centre-street-japanese-hotpot-menu.pdf" download>Download PDF</a>
            <a className="secondary-action dark" href="/menu/centre-street-japanese-hotpot-menu.pdf" target="_blank" rel="noreferrer">Open PDF</a>
          </div>
        </div>
        <div className="menu-images">
          <a href="/menu/hotpot-menu.jpg" target="_blank" rel="noreferrer">
            <img src="/menu/hotpot-menu-preview.webp" alt="Full hot pot set and appetizer menu page" width="601" height="900" loading="lazy" decoding="async" />
          </a>
          <a href="/menu/drink-menu.jpg" target="_blank" rel="noreferrer">
            <img src="/menu/drink-menu-preview.webp" alt="Full rice noodle and drink menu page" width="601" height="900" loading="lazy" decoding="async" />
          </a>
        </div>
      </section>

      <section className="visit" id="visit">
        <div className="section-heading compact">
          <p className="eyebrow">Visit us</p>
          <h2>2213 Centre St N #2243, Calgary, AB T2E 2T4</h2>
        </div>
        <div className="visit-grid">
          <article>
            <h3>Hours</h3>
            <p>Mon-Fri 17:00-22:30</p>
            <p>Sat-Sun 12:00-22:30</p>
          </article>
          <article>
            <h3>Contact</h3>
            <p>
              <a href="tel:+14034553188">Call to reserve: (403) 455-3188</a>
            </p>
            <p>Reservations, group dining, and today&apos;s availability.</p>
            <p>
              <a href="mailto:CentreStJHotpot@gmail.com">CentreStJHotpot@gmail.com</a>
            </p>
          </article>
          <article>
            <h3>Good for</h3>
            <p>Hotpot · Milk Tea · Light Meals · Snacks · Family Dining</p>
          </article>
          <article>
            <h3>Reviews</h3>
            <p>
              <a
                href="https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z/data=!3m1!4b1!4m6!3m5!1s0x537165667f6ee1f3:0x1a418403f487f9b3!8m2!3d51.0722307!4d-114.0630498!16s%2Fg%2F11bwndz8pj"
                target="_blank"
                rel="noreferrer"
              >
                Review us on Google
              </a>
            </p>
            <p>Your review helps more Calgary guests find us.</p>
          </article>
        </div>
        <div className="social-follow">
          <div>
            <p className="eyebrow">Follow & find us</p>
            <h3>See new dishes, updates, and behind-the-scenes moments.</h3>
          </div>
          <SocialLinks />
        </div>
      </section>
    </main>
  );
}
