import Link from "next/link";

const highlights = [
  "Taiwanese and Japanese-style hot pot experience",
  "Premium quality meats and fresh seafood",
  "Fresh vegetables prepared daily",
  "Multiple signature broth selections",
  "House-made sauces and customizable flavors",
  "Comfortable and modern dining atmosphere",
  "Perfect for family gatherings and group dining",
  "Convenient Calgary location",
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
        <h2>About Centre Street Japanese HotPot</h2>
        <p className="about-lead">
          Welcome to Centre Street Japanese HotPot, a Calgary restaurant built around warm hot pot dining,
          fresh ingredients, and friendly hospitality.
        </p>
      </div>

      <div className="about-story">
        <div className="about-english">
          <p>
            Welcome to Centre Street Japanese HotPot.
          </p>
          {isStandalone ? (
            <>
              <p>
                At Centre Street Japanese HotPot, we are passionate about bringing people together through the warmth and comfort of hot pot dining. Inspired by Taiwanese hot pot and Japanese-style individual hot pot traditions, we strive to create a memorable dining experience for every guest.
              </p>
              <p>
                Our menu features carefully selected meats, fresh seafood, seasonal vegetables, and flavorful broths prepared to highlight the natural taste of every ingredient. We believe that great hot pot starts with quality ingredients, which is why we focus on freshness, variety, and consistency in every meal we serve.
              </p>
              <p>
                Whether you&apos;re enjoying a family dinner, gathering with friends, celebrating a special occasion, or trying hot pot for the first time, our team is committed to providing friendly service and a welcoming atmosphere.
              </p>
              <p>
                Located in Calgary, Centre Street Japanese HotPot is proud to serve our local community and share the joy of hot pot with guests from all backgrounds.
              </p>
              <p>
                Thank you for dining with us. We look forward to welcoming you and making every visit a memorable one.
              </p>
            </>
          ) : (
            <p>
              We focus on Taiwanese and Japanese-style individual hot pot, fresh ingredients, flavorful broths, and friendly service for family dinners, group gatherings, and everyday Calgary dining.
            </p>
          )}
        </div>
        {!isStandalone && <Link className="map-link" href="/about">Read More About Us</Link>}
      </div>

      <div className="about-highlights">
        <div className="section-heading compact">
          <p className="eyebrow">Why Choose Us</p>
          <h2>What Makes Us Different</h2>
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
