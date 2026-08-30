import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: "Calgary Hot Pot Menu | AYCE $28.99 & 15 Soup Bases",
  description:
    "See our Calgary hot pot menu: $28.99 AYCE, 15 soup bases, personal hot pot, Taiwanese snacks, rice and noodles, milk tea and current prices.",
  alternates: {
    canonical: "/menu",
    languages: {
      "en-CA": "/menu/",
      "zh-Hant-CA": "/zh-hant/menu/",
      "x-default": "/menu/",
    },
  },
  openGraph: {
    title: "Calgary Hot Pot Menu | AYCE $28.99 & 15 Soup Bases",
    description:
      "See $28.99 AYCE, 15 soup bases, personal hot pot, Taiwanese snacks, rice and noodles, milk tea and current prices.",
    url: "https://centrestjhotpot.ca/menu/",
    images: ["/assets/dish-sukiyaki.webp"],
  },
};

const soups = [
  "Chicken & Spicy Pot",
  "Spicy",
  "Sukiyaki",
  "Tom Yum Kung",
  "Chinese Herbs",
  "Chicken Soup",
  "Pork Soup",
  "Sesame Oil",
  "Pickled Cabbage",
  "Curry",
  "Satay",
  "Kimchi",
  "Milk",
  "Tomato",
  "Miso",
];

const riceNoodles = [
  ["Signature Taiwanese Beef Noodle Soup", "$16.99"],
  ["Braised Pork Rice", "$12.99"],
  ["Taiwanese Fried Chicken Or Cutlet Rice / Noodle", "$14.99"],
  ["Wonton Soup with Rice / Noodle", "$14.99"],
  ["Unagi Rice Bowl", "$18.99"],
  ["Beef Brisket Rice", "$16.99"],
  ["Sukiyaki Beef Rice", "$16.99"],
];

const snacks = [
  ["Signature Taiwanese Fried Chicken", "$9.89"],
  ["Takoyaki (6pcs)", "$8.89"],
  ["Crispy Chicken Cutlet", "$9.89"],
  ["Golden Fried Buns", "$6.89"],
  ["Crispy Squid Legs", "$9.89"],
  ["Deep Fried King Mushroom", "$7.89"],
  ["Crispy Wontons (8pcs)", "$8.89"],
  ["Deep Fried Dumplings (8pcs)", "$8.89"],
  ["Chicken Spring Rolls (6pc)", "$8.89"],
  ["Veggie Spring Rolls (6pc)", "$8.89"],
  ["Popcorn Chicken", "$6.89"],
  ["French Fries", "$6.49"],
  ["Sweet Potato Fries", "$6.49"],
  ["Golden Onion Rings", "$6.49"],
  ["Fish Balls (6pc)", "$6.89"],
  ["Chinese Donut", "$6.49"],
  ["Luncheon Meat (Spam)", "$6.49"],
  ["Korean Fish Cake", "$6.49"],
  ["Edamame", "$6.49"],
];

const drinks = [
  ["Classic Teas", "$4.95"],
  ["Flavoured Black / Green Tea", "$5.95"],
  ["Milk Teas", "$5.95"],
  ["Sea Salt Cream", "$6.95"],
  ["Specialty Teas", "$5.95"],
  ["Yogurt Drinks", "$5.95"],
  ["Smoothies", "$7.95"],
  ["Specialty Sodas", "$6.95"],
  ["Soft Drinks", "$2.00"],
  ["Toppings", "+$0.75"],
];

const menuJsonLd = {
  "@context": "https://schema.org",
  "@type": "Menu",
  name: "Centre Street Japanese HotPot Menu",
  url: "https://centrestjhotpot.ca/menu/",
  hasMenuSection: [
    {
      "@type": "MenuSection",
      name: "All-You-Can-Eat Hot Pot",
      hasMenuItem: [
        {
          "@type": "MenuItem",
          name: "All-You-Can-Eat Hot Pot",
          description: "Soup base included. Meat is ordered through the server. Price before tax.",
          offers: { "@type": "Offer", price: "28.99", priceCurrency: "CAD" },
        },
        {
          "@type": "MenuItem",
          name: "All-You-Can-Eat Snacks Upgrade",
          description: "19 all-you-can-eat appetizers. Everyone at the same table must upgrade.",
          offers: { "@type": "Offer", price: "5.99", priceCurrency: "CAD" },
        },
        {
          "@type": "MenuItem",
          name: "Kids Pricing by Height",
          description: "Under 100 cm free. 100-140 cm $12.99. Over 140 cm adult price.",
        },
      ],
    },
    {
      "@type": "MenuSection",
      name: "Hot Pot Set",
      hasMenuItem: [
        {
          "@type": "MenuItem",
          name: "Start with Your Hot Pot",
          description: "Includes 1 soup base, large veggies set, 1 meat, and 1 rice or noodle side.",
          offers: { "@type": "Offer", price: "19.99", priceCurrency: "CAD" },
        },
        { "@type": "MenuItem", name: "Split Pot Upgrade", offers: { "@type": "Offer", price: "2.00", priceCurrency: "CAD" } },
        { "@type": "MenuItem", name: "Extra Meat", offers: { "@type": "Offer", price: "3.69", priceCurrency: "CAD" } },
        { "@type": "MenuItem", name: "Extra Rice or Noodle Side", offers: { "@type": "Offer", price: "2.00", priceCurrency: "CAD" } },
      ],
    },
    {
      "@type": "MenuSection",
      name: "Combo Specials",
      hasMenuItem: [
        { "@type": "MenuItem", name: "Solo Hot Pot Combo", description: "1 personal hot pot and 1 drink.", offers: { "@type": "Offer", price: "24.99", priceCurrency: "CAD" } },
        { "@type": "MenuItem", name: "Couple Hot Pot Combo", description: "2 personal hot pots, 2 drinks, and 1 appetizer.", offers: { "@type": "Offer", price: "58.99", priceCurrency: "CAD" } },
      ],
    },
    {
      "@type": "MenuSection",
      name: "Hot Pot Soup Bases",
      hasMenuItem: soups.map((name) => ({ "@type": "MenuItem", name })),
    },
    {
      "@type": "MenuSection",
      name: "Rice and Noodles",
      hasMenuItem: riceNoodles.map(([name, price]) => ({
        "@type": "MenuItem",
        name,
        offers: { "@type": "Offer", price: price.replace("$", ""), priceCurrency: "CAD" },
      })),
    },
    {
      "@type": "MenuSection",
      name: "Appetizers",
      hasMenuItem: snacks.map(([name, price]) => ({
        "@type": "MenuItem",
        name,
        offers: { "@type": "Offer", price: price.replace("$", ""), priceCurrency: "CAD" },
      })),
    },
    {
      "@type": "MenuSection",
      name: "Drinks",
      hasMenuItem: drinks.map(([name, price]) => ({
        "@type": "MenuItem",
        name,
        offers: { "@type": "Offer", price: price.replace("$", "").replace("+", ""), priceCurrency: "CAD" },
      })),
    },
  ],
};

export default function MenuPage() {
  return (
    <main>
      <link rel="preload" as="image" href="/assets/dish-sukiyaki-640.webp" media="(max-width: 760px)" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd) }}
      />
      <SiteNav currentPath="/menu/" />

      <section className="page-hero menu-page-hero">
        <div>
          <p className="eyebrow">Menu</p>
          <h1>Hot Pot Menu in Calgary with AYCE Hot Pot</h1>
          <p className="hero-text">
            Choose from Taiwanese and Japanese-style hot pot soup bases, all-you-can-eat hot pot,
            premium meats, fresh seafood, vegetables, rice and noodle bowls, Taiwanese snacks, and milk tea.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="tel:+14034553188">Call to Reserve</a>
            <a
              className="secondary-action"
              href="https://www.google.com/maps/dir/?api=1&destination=2213+Centre+St+N+%232243%2C+Calgary%2C+AB+T2E+2T4"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>

      <section className="category-section" aria-label="Browse menu categories">
        <div className="section-heading compact">
          <p className="eyebrow">Browse by category</p>
          <h2>Menu sections at a glance</h2>
        </div>
        <div className="category-strip">
          <a href="#ayce-hotpot"><span className="category-icon">AYCE</span><strong>AYCE Hot Pot</strong></a>
          <a href="#hotpot-set"><span className="category-icon">SET</span><strong>Hot Pot Set</strong></a>
          <a href="#combo-specials"><span className="category-icon">CMB</span><strong>Combos</strong></a>
          <a href="#soup-bases"><span className="category-icon">SOUP</span><strong>Soup Bases</strong></a>
          <a href="#rice-noodles"><span className="category-icon">RICE</span><strong>Rice & Noodles</strong></a>
          <a href="#drinks"><span className="category-icon">TEA</span><strong>Drinks</strong></a>
          <a href="#appetizers"><span className="category-icon">SNK</span><strong>Appetizers</strong></a>
          <a href="#full-menu"><span className="category-icon">IMG</span><strong>Full Menu</strong></a>
        </div>
      </section>

      <section className="menu-section" id="ayce-hotpot">
        <div className="section-heading">
          <p className="eyebrow">All-you-can-eat hot pot</p>
          <h2>AYCE Hot Pot Calgary: soup base included</h2>
        </div>
        <div className="set-grid">
          <article><h3>$28.99 + tax</h3><p>All-You-Can-Eat Hot Pot in Calgary with soup base included. Meat is ordered through your server.</p></article>
          <article><h3>Meat selection</h3><p>AAA beef, lamb, pork, and chicken. Each serving is 100g.</p></article>
          <article><h3>19 snacks · +$5.99</h3><p>Add 19 all-you-can-eat appetizers per person. Everyone at the same table must upgrade.</p></article>
          <article><h3>Kids pricing by height</h3><p>Under 100 cm free. 100-140 cm $12.99. Over 140 cm adult price.</p></article>
        </div>
        <div className="combo-actions">
          <Link className="primary-action" href="/ayce-hot-pot-calgary">
            View AYCE Hot Pot Calgary Details
          </Link>
          <a className="secondary-action dark" href="tel:+14034553188">
            Call (403) 455-3188
          </a>
          <a className="secondary-action dark" href="/menu/centre-street-ayce-menu-2026-08.pdf?v=20260824-599" target="_blank" rel="noreferrer">
            Open AYCE Menu
          </a>
        </div>
      </section>

      <section className="combo-promo menu-combo" id="combo-specials">
        <div className="combo-copy">
          <p className="eyebrow">Other dining options</p>
          <h2>Solo and Couple Hot Pot Combos</h2>
          <p>
            Solo Combo includes 1 personal hot pot and 1 drink for $24.99.
            Couple Combo includes 2 personal hot pots, 2 drinks, and 1 appetizer for $58.99.
            Split pot upgrade +$2. Prices are before tax.
          </p>
          <div className="combo-price-grid">
            <article><span>$24.99</span><h3>Solo Hot Pot Combo</h3><p>1 personal hot pot and 1 drink.</p></article>
            <article><span>$58.99</span><h3>Couple Hot Pot Combo</h3><p>2 personal hot pots, 2 drinks, and 1 appetizer.</p></article>
          </div>
        </div>
        <a className="combo-poster-link poster-thumbnail" href="#combo-poster" aria-label="View the complete Solo and Couple Hot Pot Combo poster"><img className="combo-poster" src="/assets/combo-hot-pot-special.webp" alt="Solo and Couple Hot Pot Combo specials" width="820" height="1230" loading="lazy" decoding="async" /><strong className="poster-open-label">View full image</strong></a>
      </section>

      <section className="poster-modal" id="combo-poster" role="dialog" aria-modal="true" aria-labelledby="combo-poster-title" data-close-target="combo-specials">
        <a className="modal-backdrop" href="#combo-specials" aria-label="Close combo poster" />
        <div className="poster-frame"><span className="modal-label" id="combo-poster-title">Solo and Couple Hot Pot Combos</span><a className="modal-close" href="#combo-specials">Close</a><img src="/assets/combo-hot-pot-special.webp" alt="Complete Solo and Couple Hot Pot Combo poster" width="820" height="1230" loading="lazy" decoding="async" /></div>
      </section>

      <section className="menu-section" id="hotpot-set">
        <div className="section-heading">
          <p className="eyebrow">Hot pot set</p>
          <h2>Choose a soup plus meat and rice or noodles</h2>
        </div>
        <div className="set-grid">
          <article><h3>Included</h3><p>1 soup base, large veggie set, 1 meat, and 1 rice or noodle side.</p></article>
          <article><h3>Choose your meat</h3><p>AAA beef, lamb, pork, or chicken. Extra meat is $3.69.</p></article>
          <article><h3>Pick your side</h3><p>Rice, instant noodles, glass noodles, ramen, udon, or braised pork rice +$1.</p></article>
          <article><h3>Add-ons</h3><p>Split pot +$2. Veggie set $9, shrimp (4pc) $6, tofu, beef balls, and other add-ons $3.</p></article>
        </div>
      </section>

      <section className="menu-section" id="soup-bases">
        <div className="section-heading">
          <p className="eyebrow">Soup bases</p>
          <h2>Signature broths for Japanese hot pot in Calgary</h2>
        </div>
        <div className="dish-showcase">
          <article className="featured-dish">
            <img src="/assets/dish-sukiyaki-640.webp" srcSet="/assets/dish-sukiyaki-320.webp 320w, /assets/dish-sukiyaki-640.webp 640w, /assets/dish-sukiyaki.webp 1024w" sizes="(max-width: 560px) 96px, (max-width: 1100px) 50vw, 33vw" alt="Sukiyaki Japanese hot pot broth in Calgary" width="900" height="675" loading="lazy" decoding="async" />
            <div><h3>Sukiyaki</h3><p>Japanese-style sweet and savoury broth</p></div>
          </article>
          <article className="featured-dish">
            <img src="/assets/dish-tom-yum-640.webp" srcSet="/assets/dish-tom-yum-320.webp 320w, /assets/dish-tom-yum-640.webp 640w, /assets/dish-tom-yum.webp 1024w" sizes="(max-width: 560px) 96px, (max-width: 1100px) 50vw, 33vw" alt="Tom Yum Kung hot pot soup base" width="900" height="675" loading="lazy" decoding="async" />
            <div><h3>Tom Yum Kung</h3><p>Thai-style hot and sour broth</p></div>
          </article>
          <article className="featured-dish">
            <img src="/assets/dish-spicy-640.webp" srcSet="/assets/dish-spicy-320.webp 320w, /assets/dish-spicy-640.webp 640w, /assets/dish-spicy.webp 1024w" sizes="(max-width: 560px) 96px, (max-width: 1100px) 50vw, 33vw" alt="Spicy hot pot soup base at Centre Street Japanese HotPot" width="900" height="675" loading="lazy" decoding="async" />
            <div><h3>Spicy Hotpot</h3><p>Rich and spicy broth</p></div>
          </article>
        </div>
        <div className="soup-list" aria-label="Soup bases">
          {soups.map((soup) => <span key={soup}>{soup}</span>)}
        </div>
      </section>

      <section className="two-column">
        <div id="rice-noodles">
          <div className="section-heading compact">
            <p className="eyebrow">Rice & noodles</p>
            <h2>Comfort bowls for dinner weekend lunch or takeout</h2>
          </div>
          <div className="price-list">
            {riceNoodles.map(([item, price]) => (
              <div key={item}><span>{item}</span><strong>{price}</strong></div>
            ))}
          </div>
        </div>
        <div id="appetizers">
          <div className="section-heading compact">
            <p className="eyebrow">Appetizers</p>
            <h2>Taiwanese snacks and crispy shareables</h2>
          </div>
          <div className="price-list">
            {snacks.map(([item, price]) => (
              <div key={item}><span>{item}</span><strong>{price}</strong></div>
            ))}
          </div>
        </div>
      </section>

      <section className="menu-section" id="drinks">
        <div className="section-heading compact">
          <p className="eyebrow">Milk tea & drinks</p>
          <h2>Milk tea specialty drinks smoothies and more</h2>
        </div>
        <div className="drink-panel">
          <img src="/assets/milk-tea-photo-640.webp" srcSet="/assets/milk-tea-photo-320.webp 320w, /assets/milk-tea-photo-640.webp 640w, /assets/milk-tea-photo.webp 900w" sizes="(max-width: 560px) calc(100vw - 32px), (max-width: 1100px) 100vw, 42vw" alt="Milk tea drinks at Centre Street Japanese HotPot Calgary" width="900" height="1200" loading="lazy" decoding="async" />
          <div className="price-list">
            {drinks.map(([item, price]) => (
              <div key={item}><span>{item}</span><strong>{price}</strong></div>
            ))}
          </div>
        </div>
      </section>

      <section className="full-menu" id="full-menu">
        <div className="section-heading">
          <p className="eyebrow">Full menu images</p>
          <h2>Browse the full in-store menu</h2>
          <div className="menu-download-actions">
            <a className="primary-action" href="/menu/centre-street-japanese-hotpot-menu.pdf" download>Download PDF</a>
            <a className="secondary-action dark" href="/menu/centre-street-japanese-hotpot-menu.pdf" target="_blank" rel="noreferrer">Open PDF</a>
          </div>
        </div>
        <div className="menu-images">
          <a className="poster-thumbnail" href="#hotpot-menu-poster" aria-label="View the complete hot pot and appetizer menu page">
            <img src="/menu/hotpot-menu-preview.webp" alt="Full hot pot set and appetizer menu page" width="601" height="900" loading="lazy" decoding="async" />
            <strong className="poster-open-label">View full page</strong>
          </a>
          <a className="poster-thumbnail" href="#drink-menu-poster" aria-label="View the complete rice noodle and drink menu page">
            <img src="/menu/drink-menu-preview.webp" alt="Full rice noodle and drink menu page" width="601" height="900" loading="lazy" decoding="async" />
            <strong className="poster-open-label">View full page</strong>
          </a>
        </div>
      </section>

      <section className="poster-modal" id="hotpot-menu-poster" role="dialog" aria-modal="true" aria-labelledby="hotpot-menu-poster-title" data-close-target="full-menu">
        <a className="modal-backdrop" href="#full-menu" aria-label="Close hot pot menu page" />
        <div className="poster-frame">
          <span className="modal-label" id="hotpot-menu-poster-title">Hot pot and appetizers</span>
          <a className="modal-close" href="#full-menu" aria-label="Close hot pot menu page">Close</a>
          <img src="/menu/hotpot-menu.jpg" alt="Complete hot pot set and appetizer menu page" width="1202" height="1800" loading="lazy" decoding="async" />
        </div>
      </section>

      <section className="poster-modal" id="drink-menu-poster" role="dialog" aria-modal="true" aria-labelledby="drink-menu-poster-title" data-close-target="full-menu">
        <a className="modal-backdrop" href="#full-menu" aria-label="Close rice noodle and drink menu page" />
        <div className="poster-frame">
          <span className="modal-label" id="drink-menu-poster-title">Rice noodles and drinks</span>
          <a className="modal-close" href="#full-menu" aria-label="Close rice noodle and drink menu page">Close</a>
          <img src="/menu/drink-menu.jpg" alt="Complete rice noodle and drink menu page" width="1202" height="1800" loading="lazy" decoding="async" />
        </div>
      </section>
    </main>
  );
}
