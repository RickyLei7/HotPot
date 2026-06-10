import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu | Centre Street Japanese HotPot Calgary",
  description:
    "Explore the Centre Street Japanese HotPot menu in Calgary, including Japanese-style hot pot soup bases, premium meats, rice and noodle bowls, Taiwanese snacks, and milk tea.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Menu | Centre Street Japanese HotPot Calgary",
    description:
      "Explore Japanese-style hot pot soup bases, premium meats, rice and noodle bowls, Taiwanese snacks, and milk tea in Calgary.",
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
  ["Taiwanese Fried Chicken Rice / Noodle", "$14.99"],
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
  ["Chicken Spring Rolls (6pc)", "$6.89"],
  ["Veggie Spring Rolls (6pc)", "$6.89"],
  ["French Fries", "$6.89"],
  ["Sweet Potato Fries", "$6.89"],
  ["Golden Onion Rings", "$8.89"],
  ["Fish Balls (6pc)", "$7.89"],
  ["Chinese Donut", "$6.89"],
  ["Luncheon Meat (Spam)", "$6.89"],
  ["Korean Fish Cake", "$6.89"],
  ["Edamame", "$5.89"],
];

const drinks = [
  ["Classic Teas", "$4.95"],
  ["Flavoured Black / Green Tea", "$5.95"],
  ["Milk Teas", "$5.95"],
  ["Sea Salt Cream", "$5.95"],
  ["Specialty Teas", "$5.95"],
  ["Yogurt Drinks", "$5.95"],
  ["Smoothies", "$7.95"],
  ["Specialty Sodas", "$6.95"],
  ["Soft Drinks", "$2.00"],
  ["Toppings", "+$0.75"],
];

export default function MenuPage() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand-mark" href="/" aria-label="Centre Street Japanese Hotpot home">
          <img src="/assets/brand-logo-wide.webp" alt="Centre Street Japanese Hotpot" />
        </a>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/menu">Menu</a>
          <a href="/about">About</a>
          <a href="/faq">FAQ</a>
          <a href="/contact">Contact</a>
          <a href="/#visit">Visit</a>
        </div>
        <a className="nav-call" href="tel:+14034553188">Call</a>
      </nav>

      <section className="page-hero menu-page-hero">
        <div>
          <p className="eyebrow">Menu</p>
          <h1>Japanese Hot Pot Menu in Calgary</h1>
          <p className="hero-text">
            Choose from Japanese-style hot pot soup bases, premium meats, fresh seafood, vegetables,
            rice and noodle bowls, Taiwanese snacks, and milk tea.
          </p>
        </div>
      </section>

      <section className="category-section" aria-label="Browse menu categories">
        <div className="section-heading compact">
          <p className="eyebrow">Browse by category</p>
          <h2>Menu sections at a glance.</h2>
        </div>
        <div className="category-strip">
          <a href="#hotpot-set"><span className="category-icon">SET</span><strong>Hot Pot Set</strong></a>
          <a href="#soup-bases"><span className="category-icon">SOUP</span><strong>Soup Bases</strong></a>
          <a href="#rice-noodles"><span className="category-icon">RICE</span><strong>Rice & Noodles</strong></a>
          <a href="#drinks"><span className="category-icon">TEA</span><strong>Drinks</strong></a>
          <a href="#appetizers"><span className="category-icon">SNK</span><strong>Appetizers</strong></a>
          <a href="#full-menu"><span className="category-icon">IMG</span><strong>Full Menu</strong></a>
        </div>
      </section>

      <section className="menu-section" id="hotpot-set">
        <div className="section-heading">
          <p className="eyebrow">Hot pot set</p>
          <h2>Start with one soup, one meat, and one rice or noodle side.</h2>
        </div>
        <div className="set-grid">
          <article><h3>Included</h3><p>1 soup base, large veggie set, 1 meat, and 1 rice or noodle side.</p></article>
          <article><h3>Choose your meat</h3><p>AAA beef, lamb, pork, or chicken. Extra meat is $3.69.</p></article>
          <article><h3>Pick your side</h3><p>Rice, instant noodles, glass noodles, ramen, udon, or braised pork rice +$1.</p></article>
        </div>
      </section>

      <section className="menu-section" id="soup-bases">
        <div className="section-heading">
          <p className="eyebrow">Soup bases</p>
          <h2>Signature broths for Japanese hot pot in Calgary.</h2>
        </div>
        <div className="soup-list" aria-label="Soup bases">
          {soups.map((soup) => <span key={soup}>{soup}</span>)}
        </div>
      </section>

      <section className="two-column">
        <div id="rice-noodles">
          <div className="section-heading compact">
            <p className="eyebrow">Rice & noodles</p>
            <h2>Comfort bowls for lunch, dinner, or takeout.</h2>
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
            <h2>Taiwanese snacks, crispy sides, and easy shareables.</h2>
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
          <h2>Tea, milk tea, specialty drinks, smoothies, sodas, and toppings.</h2>
        </div>
        <div className="price-list">
          {drinks.map(([item, price]) => (
            <div key={item}><span>{item}</span><strong>{price}</strong></div>
          ))}
        </div>
      </section>

      <section className="full-menu" id="full-menu">
        <div className="section-heading">
          <p className="eyebrow">Full menu images</p>
          <h2>Browse the full in-store menu.</h2>
        </div>
        <div className="menu-images">
          <a href="/menu/front-1.png" target="_blank" rel="noreferrer">
            <img src="/menu/front-1.png" alt="Full hot pot menu front page" />
          </a>
          <a href="/menu/back-1.png" target="_blank" rel="noreferrer">
            <img src="/menu/back-1.png" alt="Full hot pot menu back page" />
          </a>
        </div>
      </section>
    </main>
  );
}
