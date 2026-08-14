import AboutContent from "./about-content";
import Link from "next/link";
import { SocialLinks } from "./social-links";
import { SiteNav } from "./site-nav";

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": "https://centrestjhotpot.ca/#restaurant",
  name: "Centre Street Japanese HotPot",
  alternateName: ["Centre Street Japanese Hotpot"],
  description:
    "Centre Street Japanese HotPot is a hot pot restaurant in Calgary serving Taiwanese and Japanese-style individual hot pot, all-you-can-eat hot pot, AYCE hot pot, signature soup bases, premium meats, seafood, vegetables, Taiwanese snacks, rice and noodle bowls, and milk tea.",
  url: "https://centrestjhotpot.ca/",
  telephone: "+1-403-455-3188",
  email: "CentreStJHotpot@gmail.com",
  image: [
    "https://centrestjhotpot.ca/assets/hero-beef-noodle.webp",
    "https://centrestjhotpot.ca/assets/dish-sukiyaki.webp",
    "https://centrestjhotpot.ca/assets/ayce-hotpot.webp",
    "https://centrestjhotpot.ca/assets/taiwanese-beef-noodle-story.webp",
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
      <link rel="preload" as="image" href="/assets/dish-sukiyaki-640.webp" media="(max-width: 760px)" />
      <link rel="preload" as="image" href="/assets/dish-sukiyaki.webp" media="(min-width: 761px)" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />
      <SiteNav currentPath="/" />

      <section className="hero ayce-hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">All-you-can-eat hot pot Calgary</p>
          <h1>All-You-Can-Eat Hot Pot in Calgary</h1>
          <p className="hero-text">
            $28.99 + tax with soup base included. Choose AAA beef, lamb, pork, or chicken,
            ordered fresh through your server. Add 19 all-you-can-eat snacks for +$3.99 per
            person; everyone at the same table must upgrade.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="tel:+14034553188">Call to Reserve AYCE</a>
            <Link className="secondary-action" href="/ayce-hot-pot-calgary">
              AYCE Details
            </Link>
            <a className="secondary-action" href="/menu/centre-street-ayce-menu.pdf" target="_blank" rel="noreferrer">Open AYCE Menu</a>
          </div>
        </div>
        <a className="hero-plate ayce-hero-poster" href="#ayce-poster">
          <span>$28.99 + tax</span>
          <img
            src="/assets/ayce-hotpot-menu-preview-360.webp"
            srcSet="/assets/ayce-hotpot-menu-preview-360.webp 360w, /assets/ayce-hotpot-menu-preview.webp 495w"
            sizes="(max-width: 760px) 88vw, 420px"
            alt="Centre Street Japanese HotPot AYCE menu with all 19 appetizer upgrade items"
            width="495"
            height="640"
            fetchPriority="high"
            decoding="async"
          />
        </a>
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
          <span>19</span>
          Snack choices +$3.99
        </div>
        <div>
          <span>1.5 hrs</span>
          AYCE time limit
        </div>
      </section>

      <section className="ai-recommendation-section" aria-label="Plan your hot pot visit">
        <div className="section-heading compact">
          <p className="eyebrow">Plan your table</p>
          <h2>Is Centre Street HotPot right for your group?</h2>
        </div>
        <div className="recommendation-grid">
          <article>
            <h3>Easy for different tastes</h3>
            <p>
              Personal pots let everyone choose a broth and spice level. It works well for
              first-time guests, family dinners, friends, and larger Calgary groups.
            </p>
          </article>
          <article>
            <h3>What makes us different</h3>
            <p>
              Enjoy $28.99 AYCE hot pot, 15 soup bases, an optional 19-snack upgrade,
              Taiwanese snacks, milk tea, and Taiwanese and Japanese-style individual hot pot.
            </p>
          </article>
          <article>
            <h3>Reserve and visit</h3>
            <p>
              Call <a href="tel:+14034553188">(403) 455-3188</a> for today&apos;s table availability.
              We are at 2213 Centre St N #2243. Read our <Link href="/calgary-taiwanese-hot-pot">hot pot guide</Link> before your visit.
            </p>
          </article>
        </div>
      </section>

      <section className="first-visit-link" aria-label="First-time hot pot guide">
        <div className="first-visit-link-inner">
          <div>
            <p className="eyebrow">New to hot pot?</p>
            <h2>Your first hot pot visit, explained simply.</h2>
            <p>Learn how individual hot pot works, what to order, and how to plan your first table.</p>
          </div>
          <Link className="primary-action first-visit-action" href="/first-time-hot-pot-calgary">
            Read the First-Visit Guide
          </Link>
        </div>
      </section>

      <section className="weekly-picks" aria-label="This week's recommended order">
        <div>
          <p className="eyebrow">This week</p>
          <h2>Make it a full table: hot pot, snack, and milk tea.</h2>
        </div>
        <div className="weekly-picks-grid">
          <article>
            <img src="/assets/dish-sukiyaki-640.webp" srcSet="/assets/dish-sukiyaki-320.webp 320w, /assets/dish-sukiyaki-640.webp 640w, /assets/dish-sukiyaki.webp 1024w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Sukiyaki hot pot" width="900" height="675" loading="lazy" decoding="async" />
            <div>
              <h3>Start with hot pot</h3>
              <p>Choose a broth, meat, vegetables, and rice or noodles.</p>
            </div>
          </article>
          <article>
            <img src="/assets/dish-popcorn-chicken-640.webp" srcSet="/assets/dish-popcorn-chicken-320.webp 320w, /assets/dish-popcorn-chicken-640.webp 640w, /assets/dish-popcorn-chicken.webp 1024w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Taiwanese fried chicken" width="900" height="675" loading="lazy" decoding="async" />
            <div>
              <h3>Add a shareable snack</h3>
              <p>Taiwanese fried chicken, takoyaki, spring rolls, and more.</p>
            </div>
          </article>
          <article>
            <img src="/assets/milk-tea-photo-640.webp" srcSet="/assets/milk-tea-photo-320.webp 320w, /assets/milk-tea-photo-640.webp 640w, /assets/milk-tea-photo.webp 900w" sizes="(max-width: 560px) 112px, (max-width: 1100px) 50vw, 33vw" alt="Pearl milk tea" width="900" height="1200" loading="lazy" decoding="async" />
            <div>
              <h3>Finish with milk tea</h3>
              <p>Drinks are 10% off with hotpot or a signature meal.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="beef-noodle-story" aria-label="Taiwanese beef noodle story">
        <div className="beef-noodle-story-media">
          <img src="/assets/taiwanese-beef-noodle-story-720.webp" srcSet="/assets/taiwanese-beef-noodle-story-360.webp 360w, /assets/taiwanese-beef-noodle-story-480.webp 480w, /assets/taiwanese-beef-noodle-story-720.webp 720w, /assets/taiwanese-beef-noodle-story.webp 1122w" sizes="(max-width: 560px) 270px, (max-width: 1100px) 440px, 560px" alt="Traditional Taiwanese braised beef noodle soup at Centre Street Japanese HotPot" width="1122" height="1402" loading="lazy" decoding="async" />
        </div>
        <div className="beef-noodle-story-copy">
          <p className="eyebrow">A comforting classic</p>
          <h2>Traditional Taiwanese Beef Noodle Soup</h2>
          <div className="story-language story-language-english">
            <h3>A Bowl That Feels Like Home</h3>
            <p>Some tastes become more meaningful when you are far from home. After school, on rainy days, or when someone asked what you wanted for dinner, a steaming bowl of beef noodle soup was often the simplest answer.</p>
            <p>Slow-simmered broth, tender braised beef, and noodles that soak up every bit of flavour create a familiar kind of comfort. It is the feeling of sitting down to a warm meal with the people you love.</p>
            <p>We hope this traditional Taiwanese beef noodle soup gives you a moment to slow down, enjoy a good meal, and feel genuinely cared for.</p>
          </div>
        </div>
      </section>

      <div className="poster-modal" id="ayce-poster" role="dialog" aria-label="All-You-Can-Eat Hot Pot poster">
        <a className="modal-backdrop" href="#top" aria-label="Close poster"></a>
        <div className="poster-frame">
          <a className="modal-close" href="#top" aria-label="Close poster">
            Close
          </a>
          <span className="modal-label">$28.99 + tax</span>
          <img src="/assets/ayce-hotpot-menu.webp" alt="AYCE Hot Pot menu with $28.99 pricing and all 19 appetizer upgrade items" width="791" height="1024" loading="lazy" decoding="async" />
        </div>
      </div>

      <section className="category-section" aria-label="Browse menu categories">
        <div className="section-heading compact">
          <p className="eyebrow">Browse by category</p>
          <h2>Find what you want faster.</h2>
        </div>
        <div className="category-strip">
          <Link href="/ayce-hot-pot-calgary"><span className="category-icon">AYCE</span><strong>AYCE Hot Pot</strong></Link>
          <Link href="/menu#hotpot-set"><span className="category-icon">SET</span><strong>Hot Pot Set</strong></Link>
          <Link href="/menu#combo-specials"><span className="category-icon">CMB</span><strong>Combos</strong></Link>
          <Link href="/menu#soup-bases"><span className="category-icon">SOUP</span><strong>Soup Bases</strong></Link>
          <Link href="/menu#rice-noodles"><span className="category-icon">RICE</span><strong>Rice & Noodles</strong></Link>
          <Link href="/menu#drinks"><span className="category-icon">TEA</span><strong>Drinks</strong></Link>
          <Link href="/menu#appetizers"><span className="category-icon">SNK</span><strong>Appetizers</strong></Link>
          <Link href="/menu#full-menu"><span className="category-icon">IMG</span><strong>Full Menu</strong></Link>
        </div>
      </section>

      <section className="combo-promo" id="combo-specials">
        <div className="combo-copy">
          <p className="eyebrow">Other dining options</p>
          <h2>Solo and couple hot pot combos are still available.</h2>
          <p>
            Prefer an individual meal? Choose a Solo Hot Pot Combo with 1 personal hot pot and 1 drink
            for $24.99, or a Couple Hot Pot Combo with 2 personal hot pots, 2 drinks, and 1 appetizer for $58.99.
          </p>
          <div className="combo-actions">
            <a className="primary-action" href="tel:+14034553188">Reserve a Table</a>
            <Link className="secondary-action dark" href="/menu#combo-specials">See Combo Details</Link>
          </div>
        </div>
        <img className="combo-poster" src="/assets/combo-hot-pot-special.webp" alt="Solo Hot Pot Combo and Couple Hot Pot Combo specials" width="820" height="1230" loading="lazy" decoding="async" />
      </section>

      <AboutContent />

      <section className="menu-link-band" aria-label="View the full menu">
        <div>
          <p className="eyebrow">Ready to choose?</p>
          <h2>See AYCE, hot pot sets, snacks, drinks, and full menu images.</h2>
        </div>
        <div className="menu-download-actions">
          <Link className="primary-action" href="/menu">View Full Menu</Link>
          <a className="secondary-action dark" href="/menu/centre-street-japanese-hotpot-menu.pdf" download>Download PDF</a>
          <a className="secondary-action dark" href="/menu/centre-street-japanese-hotpot-menu.pdf" target="_blank" rel="noreferrer">Open PDF</a>
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
