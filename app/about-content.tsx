import Link from "next/link";

const highlights = [
  ["台式與日式火鍋用餐體驗", "Taiwanese and Japanese-style hot pot experience"],
  ["精選優質肉品與新鮮海鮮", "Premium quality meats and fresh seafood"],
  ["每日供應新鮮蔬菜與食材", "Fresh vegetables prepared daily"],
  ["多款特色湯底選擇", "Multiple signature broth selections"],
  ["特製醬料自由搭配", "House-made sauces and customizable flavors"],
  ["舒適現代的用餐環境", "Comfortable and modern dining atmosphere"],
  ["適合家庭聚餐與朋友聚會", "Perfect for family gatherings and group dining"],
  ["位於卡加利，交通便利", "Convenient Calgary location"],
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
        <h2>關於鼎鑽火鍋</h2>
        <p className="about-lead">
          Welcome to Centre Street Japanese HotPot, a Calgary restaurant built around warm hot pot dining,
          fresh ingredients, and friendly hospitality.
        </p>
      </div>

      <div className="about-story">
        <div className="about-copy">
          <p>
            歡迎來到鼎鑽火鍋 Centre Street Japanese HotPot。
          </p>
          {isStandalone ? (
            <>
              <p>
                在鼎鑽火鍋，我們相信火鍋不只是美食，更是一種與家人朋友共享歡樂時光的方式。我們以台式與日式火鍋文化為靈感，結合對食材品質與用餐體驗的堅持，希望為每位顧客帶來溫暖、舒適且難忘的火鍋體驗。
              </p>
              <p>
                我們精選優質肉品、新鮮海鮮、當季蔬菜及多款特色湯底，讓每一份食材都能展現最自然鮮美的風味。我們始終堅持新鮮、品質與穩定，致力於為顧客提供值得信賴的餐點與服務。
              </p>
              <p>
                無論是家庭聚餐、朋友相聚、節日慶祝，或是第一次體驗火鍋，我們都希望透過貼心的服務與舒適的環境，讓每位來訪的顧客都能感受到賓至如歸的溫暖。
              </p>
              <p>
                位於卡加利的鼎鑽火鍋，很榮幸能夠服務本地社區，並與大家分享火鍋所帶來的美味與歡樂。
              </p>
              <p>
                感謝您的支持與光臨。我們期待在鼎鑽火鍋歡迎您的到來，並為您創造一次又一次美好的用餐回憶。
              </p>
            </>
          ) : (
            <p>
              我們以台式與日式火鍋文化為靈感，精選優質肉品、新鮮海鮮、當季蔬菜及多款特色湯底，讓每位客人都能享受溫暖、舒適的火鍋體驗。
            </p>
          )}
        </div>

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
          <h2>我們的特色</h2>
        </div>
        <div className="about-highlight-grid">
          {visibleHighlights.map(([zh, en]) => (
            <article key={en}>
              <h3>{zh}</h3>
              <p>{en}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
