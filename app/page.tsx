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

const drinks = [
  "Classic Teas",
  "Flavoured Black / Green Tea",
  "Milk Teas",
  "Sea Salt Cream",
  "Specialty Teas",
  "Yogurt Drinks",
  "Smoothies",
  "Specialty Sodas",
];

export default function Home() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand-mark" href="#top" aria-label="Centre Street Japanese Hotpot home">
          <img src="/assets/brand-logo-wide.webp" alt="Centre Street Japanese Hotpot" />
        </a>
        <div className="nav-links">
          <a href="#menu">Menu</a>
          <a href="#chef">Chef</a>
          <a href="#specials">Specials</a>
          <a href="#visit">Visit</a>
        </div>
        <a className="nav-call" href="tel:+14034553188">
          Call
        </a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Japanese & Taiwanese Mini Hotpot · 一人一锅</p>
          <h1>Centre Street Japanese Hotpot</h1>
          <p className="hero-text">
            Calgary hotpot for one, with fresh soup bases, sizzling Taiwanese
            snacks, rice and noodle bowls, and milk tea made for the table.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="tel:+14034553188">
              (403) 455-3188
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
          <img src="/assets/hero-beef-noodle.webp" alt="Signature Taiwanese beef noodle soup" />
        </div>
      </section>

      <section className="quick-info" aria-label="Restaurant highlights">
        <div>
          <span>$19.99</span>
          Start with your hot pot
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

      <section className="feature-band" id="specials">
        <div className="section-heading">
          <p className="eyebrow">Hotpot set</p>
          <h2>Start with one soup, one meat, and one rice or noodle side.</h2>
        </div>
        <div className="set-grid">
          <article>
            <h3>Included</h3>
            <p>1 soup base, large veggie set, 1 meat, and 1 rice or noodle side.</p>
          </article>
          <article>
            <h3>Choose your meat</h3>
            <p>AAA beef, lamb, pork, or chicken. Extra meat is $3.69.</p>
          </article>
          <article>
            <h3>Pick your side</h3>
            <p>Rice, instant noodles, glass noodles, ramen, udon, or braised pork rice +$1.</p>
          </article>
        </div>
      </section>

      <section className="chef-section" id="chef">
        <div className="chef-intro">
          <p className="eyebrow">Meet Our Chef</p>
          <h2>Chef James</h2>
          <p className="chef-lead">
            对于 Chef James 来说，一锅好汤不仅是一道料理，更是一份温暖人心的记忆。
          </p>
        </div>
        <div className="chef-story">
          <p>
            James 出生于台湾，从小在充满烟火气息的传统家庭中长大。儿时厨房里飘散的汤香、夜市里热腾腾的小吃，以及家人围坐共享美食的幸福时光，都成为他日后踏入餐饮行业最深刻的启发。
          </p>
          <p>
            拥有超过 30 年餐饮经验的 James，曾在台湾及海外多家知名餐厅担任主厨与餐饮顾问，专注研究亚洲风味料理、火锅汤底与传统家常菜。他始终相信，真正打动人心的美食，不是复杂的技巧，而是对食材的尊重与对品质的坚持。
          </p>
          <p>
            来到加拿大后，James 希望把台湾人记忆中的温暖味道带给更多家庭。因此，他将台湾经典风味与日式精致饮食文化融合，打造出属于 Centre Street Japanese Hotpot 的独特特色。
          </p>
          <p>
            从每天熬制的汤底，到精心挑选的肉品、新鲜蔬菜以及台湾特色小吃，每一个细节都凝聚着 James 对料理的热爱与坚持。
          </p>
          <blockquote>
            “最好的火锅，不只是让人吃饱，而是让人想起家。”
          </blockquote>
          <p>
            今天，当您来到 Centre Street Japanese Hotpot，品尝的不仅是一顿火锅，更是一位拥有三十多年经验的台湾主厨，倾注心血与故事所呈现的美味旅程。
          </p>
        </div>
      </section>

      <section className="menu-section" id="menu">
        <div className="section-heading">
          <p className="eyebrow">Choose your broth</p>
          <h2>From mellow chicken soup to spicy satay and bright tomato.</h2>
        </div>
        <img className="wide-food" src="/assets/soup-lineup.webp" alt="Hotpot soup base lineup" />
        <div className="soup-list" aria-label="Soup bases">
          {soups.map((soup) => (
            <span key={soup}>{soup}</span>
          ))}
        </div>
      </section>

      <section className="two-column">
        <div>
          <div className="section-heading compact">
            <p className="eyebrow">Signature rice & noodles</p>
            <h2>Comfort bowls for lunch, dinner, or takeout cravings.</h2>
          </div>
          <div className="price-list">
            {riceNoodles.map(([item, price]) => (
              <div key={item}>
                <span>{item}</span>
                <strong>{price}</strong>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="section-heading compact">
            <p className="eyebrow">Milk tea & drinks</p>
            <h2>Sweetness and ice your way, with hot tea available too.</h2>
          </div>
          <div className="drink-panel">
            <img src="/assets/drink-lineup.webp" alt="Milk tea and specialty drinks" />
            <div>
              {drinks.map((drink) => (
                <span key={drink}>{drink}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="snacks-section">
        <div className="section-heading">
          <p className="eyebrow">Appetizers</p>
          <h2>Taiwanese snacks, crispy sides, and easy shareables.</h2>
        </div>
        <img className="wide-food" src="/assets/snack-lineup.webp" alt="Appetizer lineup" />
        <div className="snack-grid">
          {snacks.map(([item, price]) => (
            <article key={item}>
              <h3>{item}</h3>
              <p>{price}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="full-menu">
        <div className="section-heading">
          <p className="eyebrow">Original menu</p>
          <h2>Browse the full in-store menu.</h2>
        </div>
        <div className="menu-images">
          <a href="/menu/front-1.png" target="_blank" rel="noreferrer">
            <img src="/menu/front-1.png" alt="Full hotpot menu front" />
          </a>
          <a href="/menu/back-1.png" target="_blank" rel="noreferrer">
            <img src="/menu/back-1.png" alt="Full hotpot menu back" />
          </a>
        </div>
      </section>

      <section className="visit" id="visit">
        <div className="section-heading compact">
          <p className="eyebrow">Visit us</p>
          <h2>2243-2213 Centre St. N., Calgary, AB T2E 2T4</h2>
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
              <a href="tel:+14034553188">(403) 455-3188</a>
            </p>
            <p>
              <a href="mailto:CentreStJHotpot@gmail.com">CentreStJHotpot@gmail.com</a>
            </p>
          </article>
          <article>
            <h3>Good for</h3>
            <p>Hotpot · Milk Tea · Light Meals · Snacks · Family Dining</p>
          </article>
        </div>
        <a
          className="map-link"
          href="https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z/data=!3m1!4b1!4m6!3m5!1s0x537165667f6ee1f3:0x1a418403f487f9b3!8m2!3d51.0722307!4d-114.0630498!16s%2Fg%2F11bwndz8pj"
          target="_blank"
          rel="noreferrer"
        >
          Open in Google Maps
        </a>
      </section>
    </main>
  );
}
