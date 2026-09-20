import Link from "next/link";

const highlights = [
  "15 soup bases",
  "Personal hot pot",
  "$28.99 AYCE hot pot",
  "Taiwanese snacks and milk tea",
  "Centre Street location in Calgary",
];

export default function AboutContent({
  isStandalone = false,
}: {
  isStandalone?: boolean;
}) {
  const visibleHighlights = isStandalone ? highlights : highlights.slice(0, 4);

  return (
    <section className={isStandalone ? "about-section about-page" : "about-section"} id="about">
      <div className="about-intro">
        <p className="eyebrow">About Us</p>
        <h2>Hot Pot Your Way</h2>
        <p className="about-lead">
          Choose your own soup base, meal and spice level, then enjoy hot pot together at the same table.
        </p>
      </div>

      <div className="about-story">
        <div className="about-english">
          {isStandalone ? (
            <>
              <p>
                Centre Street Japanese HotPot serves Taiwanese and Japanese-style individual hot pot in Calgary. Each guest gets a personal pot and can choose from 15 soup bases.
              </p>
              <p>
                Choose a $19.99 personal hot pot or $28.99 AYCE hot pot. The menu also includes Taiwanese snacks, rice and noodle bowls, milk tea and other drinks.
              </p>
              <p>
                Personal pots make it easy for families and friends to choose different flavours at one table. If it is your first visit, our team can help you get started.
              </p>
            </>
          ) : (
            <p>
              Choose from personal hot pot, AYCE, Taiwanese snacks, rice and noodle bowls, and milk tea.
            </p>
          )}
        </div>
        {!isStandalone && <Link className="map-link" href="/about">Read More About Us</Link>}
      </div>

      <div className="about-highlights">
        <div className="section-heading compact">
          <p className="eyebrow">At a glance</p>
          <h2>What You Can Order</h2>
        </div>
        <div className="about-highlight-grid">
          {visibleHighlights.map((highlight) => (
            <article key={highlight}>
              <h3>{highlight}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
