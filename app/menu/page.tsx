import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu | Centre Street Japanese HotPot Calgary",
  description:
    "Explore the Centre Street Japanese HotPot menu in Calgary, including Japanese-style hot pot soup bases, premium meats, rice and noodle bowls, Taiwanese snacks, and milk tea.",
};

const soups = [
  "Chicken & Spicy Yuan Yang Pot",
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
  ["Signature Taiwanese Popcorn Chicken", "$9.89"],
  ["Takoyaki (6pcs)", "$8.89"],
  ["Crispy Chicken Cutlet", "$9.89"],
  ["Golden Fried Buns", "$6.89"],
  ["Crispy Squid Legs", "$9.89"],
  ["Deep Fried King Mushroom", "$7.89"],
  ["Crispy Wontons (8pcs)", "$8.89"],
  ["Deep Fried Dumplings (8pcs)", "$8.89"],
];

export default function MenuPage() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand-mark" href="/" aria-label="Centre Street Japanese Hotpot home">
          <img src="/assets/brand-logo-wide.webp" alt="Centre Street Japanese Hotpot" />
        </a>
        <div className="nav-links">
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

      <section className="menu-section">
        <div className="section-heading">
          <p className="eyebrow">Soup bases</p>
          <h2>Signature broths for Japanese hot pot in Calgary.</h2>
        </div>
        <div className="soup-list" aria-label="Soup bases">
          {soups.map((soup) => <span key={soup}>{soup}</span>)}
        </div>
      </section>

      <section className="two-column">
        <div>
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
        <div>
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
    </main>
  );
}
