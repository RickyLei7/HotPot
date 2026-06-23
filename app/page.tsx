import AboutContent from "./about-content";
import Link from "next/link";
import { SocialLinks } from "./social-links";

export default function Home() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand-mark" href="#top" aria-label="Centre Street Japanese Hotpot home">
          <img src="/assets/brand-logo-wide.webp" alt="Centre Street Japanese Hotpot" />
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
          <p className="eyebrow">Japanese & Taiwanese Mini Hotpot · 一人一锅</p>
          <h1>Centre Street Japanese Hotpot</h1>
          <p className="hero-text">
            Calgary hotpot for one, with fresh soup bases, Taiwanese snacks,
            rice and noodle bowls, and milk tea made for sharing. Call us to reserve a table
            or ask about today&apos;s availability.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="tel:+14034553188">
              Call (403) 455-3188 to Reserve
            </a>
            <a className="secondary-action" href="#combo-specials">
              View Combo Specials
            </a>
            <a className="secondary-action" href="#specials">
              AYCE Coming Soon
            </a>
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
          <img src="/assets/dish-beef-noodle.webp" alt="Signature Taiwanese beef noodle soup" />
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
          <span>$24.99</span>
          Solo hot pot combo
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
          <p className="eyebrow">Coming soon</p>
          <h2>All-You-Can-Eat Hot Pot is on the way.</h2>
          <p>$28.99 + tax · Soup base included · Final launch details coming soon.</p>
          <div className="ayce-actions">
            <a className="primary-action" href="tel:+14034553188">
              Call for Launch Details
            </a>
            <a className="secondary-action" href="#ayce-poster">
              View Poster
            </a>
          </div>
        </div>
        <a className="ayce-card" href="#ayce-poster" aria-label="View All-You-Can-Eat Hot Pot poster">
          <span>Coming Soon</span>
          <img src="/assets/ayce-coming-soon-preview.webp" alt="All-You-Can-Eat Hot Pot coming soon poster with kids pricing by height" width="620" height="876" loading="lazy" decoding="async" />
        </a>
      </section>

      <div className="poster-modal" id="ayce-poster" role="dialog" aria-label="All-You-Can-Eat Hot Pot coming soon poster">
        <a className="modal-backdrop" href="#specials" aria-label="Close poster"></a>
        <div className="poster-frame">
          <a className="modal-close" href="#specials" aria-label="Close poster">
            Close
          </a>
          <span className="modal-label">Coming Soon</span>
          <img src="/assets/ayce-coming-soon-height.png" alt="All-You-Can-Eat Hot Pot coming soon poster with kids pricing by height" width="1055" height="1491" loading="lazy" decoding="async" />
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
          <a href="/menu/front-1.png" target="_blank" rel="noreferrer">
            <img src="/menu/front-1-preview.webp" alt="Full hotpot menu front" width="900" height="1347" loading="lazy" decoding="async" />
          </a>
          <a href="/menu/back-1.png" target="_blank" rel="noreferrer">
            <img src="/menu/back-1-preview.webp" alt="Full hotpot menu back" width="900" height="1347" loading="lazy" decoding="async" />
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
