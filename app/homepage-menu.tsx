import Link from "next/link";
import { homepageContent, type HomepageLanguage } from "./homepage-content";
import { SiteNav } from "./site-nav";
import { SocialLinks } from "./social-links";

const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=2213+Centre+St+N+%232243%2C+Calgary%2C+AB+T2E+2T4";
const googleReviewUrl = "https://g.page/r/CbP5h_QDhEEaEBM/review";

export function HomepageMenu({ language }: { language: HomepageLanguage }) {
  const isZh = language === "zh-Hant";
  const content = homepageContent[isZh ? "zhHant" : "en"];
  const menuPath = isZh ? "/zh-hant/menu/" : "/menu/";
  const aycePath = isZh ? "/zh-hant/ayce-hot-pot-calgary/" : "/ayce-hot-pot-calgary/";
  const restaurantInfoPath = isZh ? "/zh-hant/restaurant-info/" : "/restaurant-info/";
  const localGuideLinks = isZh
    ? [
        { href: "/zh-hant/calgary-hot-pot-guide/", label: "卡加利火鍋指南" },
        { href: "/zh-hant/calgary-taiwanese-hot-pot/", label: "卡加利台式火鍋" },
        { href: "/zh-hant/first-time-hot-pot-calgary/", label: "第一次吃火鍋指南" },
        { href: "/zh-hant/ayce-hot-pot-calgary/", label: "卡加利火鍋自助" },
      ]
    : [
        { href: "/calgary-hot-pot-guide/", label: "Calgary Hot Pot Guide" },
        { href: "/calgary-taiwanese-hot-pot/", label: "Taiwanese Hot Pot Calgary" },
        { href: "/first-time-hot-pot-calgary/", label: "First-Time Hot Pot Guide" },
        { href: "/ayce-hot-pot-calgary/", label: "AYCE Hot Pot Calgary" },
      ];
  const snackImages = [
    { src: "/assets/ayce-signature-fried-chicken-2026-08-18-320.webp", srcSet: "/assets/ayce-signature-fried-chicken-2026-08-18-224.webp 224w, /assets/ayce-signature-fried-chicken-2026-08-18-320.webp 320w, /assets/ayce-signature-fried-chicken-2026-08-18-640.webp 640w" },
    { src: "/assets/ayce-takoyaki-320.webp", srcSet: "/assets/ayce-takoyaki-224.webp 224w, /assets/ayce-takoyaki-320.webp 320w, /assets/ayce-takoyaki-640.webp 640w" },
    { src: "/assets/ayce-snacks/crispy-chicken-cutlet-320.webp" },
    { src: "/assets/ayce-snacks/golden-fried-buns-320.webp" },
    { src: "/assets/ayce-snacks/crispy-squid-legs-320.webp" },
  ];

  return (
    <main>
      <SiteNav currentPath={content.navPath} language={language} />

      <section id="ayce" className="homepage-ayce">
        <div className="homepage-ayce-copy">
          <p className="eyebrow">{content.ayce.eyebrow}</p>
          <h1>{content.ayce.title}</h1>
          <p className="homepage-lead">{content.ayce.lead}</p>
          <p>{content.ayce.detail}</p>
          <div className="hero-actions">
            <a className="primary-action" href="tel:+14034553188">{content.ayce.reserve}</a>
            <Link className="secondary-action" href={aycePath}>{content.ayce.menu}</Link>
          </div>
        </div>
        <a className="homepage-ayce-media poster-thumbnail" href="#homepage-ayce-image" aria-label={isZh ? "15 款湯底 查看完整圖片 火鍋自助" : "15 soup bases View full image AYCE hot pot"}>
          <img src="/assets/ayce-menu-2026-08-18-720.webp" srcSet="/assets/ayce-menu-2026-08-18-480.webp 480w, /assets/ayce-menu-2026-08-18-720.webp 720w, /assets/ayce-menu-2026-08-18.webp 1200w" sizes="(max-width: 760px) calc(100vw - 32px), 42vw" alt={isZh ? "鼎鑽火鍋火鍋自助" : "AYCE hot pot at Centre Street Japanese HotPot"} width="1200" height="1553" fetchPriority="high" decoding="async" />
          <span>15 {isZh ? "款湯底" : "soup bases"}</span>
          <strong className="poster-open-label">{isZh ? "查看完整圖片" : "View full image"}</strong>
        </a>
      </section>

      <section className="poster-modal" id="homepage-ayce-image" role="dialog" aria-modal="true" aria-labelledby="homepage-ayce-image-title" data-close-target="ayce">
        <a className="modal-backdrop" href="#ayce" aria-label={isZh ? "關閉完整火鍋自助圖片" : "Close complete AYCE image"} />
        <div className="poster-frame"><span className="modal-label" id="homepage-ayce-image-title">{isZh ? "火鍋自助完整圖片" : "Complete AYCE image"}</span><a className="modal-close" href="#ayce">{isZh ? "關閉" : "Close"}</a><img src="/assets/ayce-menu-2026-08-18.webp" alt={isZh ? "鼎鑽火鍋火鍋自助完整圖片" : "Complete AYCE hot pot image at Centre Street Japanese HotPot"} width="1200" height="1553" loading="lazy" decoding="async" /></div>
      </section>

      <section className="ayce-snack-feature" aria-labelledby="snack-title">
        <div className="section-heading compact">
          <p className="eyebrow">{content.ayce.snackEyebrow}</p>
          <h2 id="snack-title">{content.ayce.snackTitle}</h2>
          <p>{content.ayce.snackLead}</p>
        </div>
        <div className="snack-showcase">
          {content.ayce.snackNames.map((name, index) => (
            <article className={index === 0 ? "snack-card is-featured" : "snack-card"} key={name}>
              <img src={snackImages[index].src} srcSet={snackImages[index].srcSet} sizes={index === 0 ? "(max-width: 760px) 88vw, 420px" : "(max-width: 760px) 44vw, 220px"} alt={name} width="320" height="220" loading="lazy" decoding="async" />
              <h3>{name}</h3>
            </article>
          ))}
        </div>
        <p className="snack-rule"><strong>{content.ayce.snackRule}</strong> {content.ayce.individualNote}</p>
        <Link className="text-action" href={menuPath}>{content.lightMeals.menu}</Link>
      </section>

      <section id="personal-hot-pot" className="personal-value">
        <div className="personal-value-copy">
          <p className="eyebrow">{content.personal.eyebrow}</p>
          <h2>{content.personal.title}</h2>
          <p className="homepage-lead">{content.personal.lead}</p>
          <div className="inclusion-grid">
            {content.personal.inclusions.map((item, index) => <article key={item}><span>{index + 1}</span><p>{item}</p></article>)}
          </div>
          <p className="split-pot-note">{content.personal.splitPot}</p>
          <small>{content.personal.comboNote}</small>
          <div className="hero-actions"><Link className="primary-action" href={menuPath}>{content.personal.menu}</Link></div>
        </div>
        <a className="soup-preview-strip poster-thumbnail" href="#personal-menu-image" aria-label={isZh ? "查看完整菜單 個人火鍋" : "View full menu Personal hot pot"}>
          <img src="/assets/personal-hot-pot-menu-full-720.webp" srcSet="/assets/personal-hot-pot-menu-full-480.webp 480w, /assets/personal-hot-pot-menu-full-720.webp 720w, /assets/personal-hot-pot-menu-full.webp 1400w" sizes="(max-width: 760px) calc(100vw - 32px), 42vw" alt={isZh ? "鼎鑽火鍋完整個人火鍋菜單與 15 款湯底" : "Full personal hot pot menu with fifteen soup base choices at Centre Street Japanese HotPot"} width="1400" height="2096" loading="lazy" decoding="async" />
          <strong className="poster-open-label">{isZh ? "查看完整菜單" : "View full menu"}</strong>
        </a>
      </section>

      <section className="poster-modal" id="personal-menu-image" role="dialog" aria-modal="true" aria-labelledby="personal-menu-image-title" data-close-target="personal-hot-pot">
        <a className="modal-backdrop" href="#personal-hot-pot" aria-label={isZh ? "關閉個人火鍋菜單" : "Close personal hot pot menu"} />
        <div className="poster-frame"><span className="modal-label" id="personal-menu-image-title">{isZh ? "完整個人火鍋菜單" : "Full personal hot pot menu"}</span><a className="modal-close" href="#personal-hot-pot">{isZh ? "關閉" : "Close"}</a><img src="/assets/personal-hot-pot-menu-full.webp" alt={isZh ? "鼎鑽火鍋完整個人火鍋菜單與 15 款湯底" : "Full personal hot pot menu with fifteen soup base choices"} width="1400" height="2096" loading="lazy" decoding="async" /></div>
      </section>

      <section id="beef-noodle" className="beef-noodle-feature">
        <a className="beef-noodle-feature-media poster-thumbnail" href="#beef-noodle-story-image" aria-label={isZh ? "查看完整圖片 牛肉麵故事" : "View full image Beef noodle story"}>
          <img src="/assets/taiwanese-beef-noodle-story-720.webp" srcSet="/assets/taiwanese-beef-noodle-story-360.webp 360w, /assets/taiwanese-beef-noodle-story-480.webp 480w, /assets/taiwanese-beef-noodle-story-720.webp 720w" sizes="(max-width: 760px) 88vw, 520px" alt={content.beefNoodle.alt} width="1122" height="1402" loading="lazy" decoding="async" />
          <strong className="poster-open-label">{isZh ? "查看完整圖片" : "View full image"}</strong>
        </a>
        <div className="beef-noodle-feature-copy">
          <p className="eyebrow">{content.beefNoodle.eyebrow}</p>
          <h2>{content.beefNoodle.title}</h2>
          <strong className="menu-price">{content.beefNoodle.price}</strong>
          <h3>{content.beefNoodle.storyTitle}</h3>
          {content.beefNoodle.paragraphs.map((text) => <p key={text}>{text}</p>)}
        </div>
      </section>

      <section className="poster-modal" id="beef-noodle-story-image" role="dialog" aria-modal="true" aria-labelledby="beef-noodle-story-image-title" data-close-target="beef-noodle">
        <a className="modal-backdrop" href="#beef-noodle" aria-label={isZh ? "關閉牛肉麵故事圖片" : "Close beef noodle story image"} />
        <div className="poster-frame"><span className="modal-label" id="beef-noodle-story-image-title">{isZh ? "台灣傳統牛肉麵" : "Traditional Taiwanese beef noodle soup"}</span><a className="modal-close" href="#beef-noodle">{isZh ? "關閉" : "Close"}</a><img src="/assets/taiwanese-beef-noodle-story.webp" alt={content.beefNoodle.alt} width="1122" height="1402" loading="lazy" decoding="async" /></div>
      </section>

      <section id="light-meals" className="light-meals-section">
        <div className="section-heading compact">
          <p className="eyebrow">{content.lightMeals.eyebrow}</p>
          <h2>{content.lightMeals.title}</h2>
          <p>{content.lightMeals.lead}</p>
        </div>
        <div className="light-meal-grid">
          {content.lightMeals.items.map((meal) => (
            <article className="light-meal-card" key={meal.slug}>
              <img src={`/assets/light-meals/${meal.slug}-1024.webp`} srcSet={`/assets/light-meals/${meal.slug}-480.webp 480w, /assets/light-meals/${meal.slug}-1024.webp 1024w`} sizes="(max-width: 560px) 46vw, (max-width: 1100px) 45vw, 30vw" alt={meal.alt} width="1024" height="704" loading="lazy" decoding="async" />
              <div><h3>{meal.name}</h3><strong>{meal.price}</strong><p>{meal.description}</p></div>
            </article>
          ))}
        </div>
        <Link className="primary-action" href={menuPath}>{content.lightMeals.menu}</Link>
      </section>

      <section id="drinks" className="drink-feature">
        <div className="drink-feature-copy">
          <p className="eyebrow">{content.drinks.eyebrow}</p>
          <h2>{content.drinks.title}</h2>
          <p>{content.drinks.lead}</p>
          <strong className="drink-discount">{content.drinks.discount}</strong>
          <div className="drink-category-grid">
            {content.drinks.categories.map((drink) => <p key={drink.name}><span>{drink.name}</span><strong>{drink.price}</strong></p>)}
          </div>
        </div>
        <img src="/assets/milk-tea-photo-640.webp" srcSet="/assets/milk-tea-photo-320.webp 320w, /assets/milk-tea-photo-640.webp 640w, /assets/milk-tea-photo.webp 900w" sizes="(max-width: 760px) 74vw, 380px" alt={content.drinks.alt} width="900" height="1200" loading="lazy" decoding="async" />
      </section>

      <section id="visit" className="homepage-visit">
        <div className="section-heading compact"><p className="eyebrow">{content.visit.eyebrow}</p><h2>{content.visit.title}</h2></div>
        <div className="visit-grid">
          <article><h3>{content.visit.hoursTitle}</h3>{content.visit.hours.map((hours) => <p key={hours}>{hours}</p>)}<Link href={restaurantInfoPath}>{content.visit.details}</Link></article>
          <article><h3>{content.visit.contactTitle}</h3><p>{content.visit.contactCopy}</p><a href="tel:+14034553188">{content.visit.reserve}</a></article>
          <article><h3>{content.visit.directions}</h3><p>2213 Centre St N #2243, Calgary, AB T2E 2T4</p><a href={directionsUrl} target="_blank" rel="noreferrer">{content.visit.directions}</a></article>
          <article><h3>{content.visit.reviewTitle}</h3><p>{content.visit.reviewCopy}</p><a href={googleReviewUrl} target="_blank" rel="noreferrer">{content.visit.review}</a></article>
        </div>
        <div className="social-follow"><div><p className="eyebrow">{content.visit.socialEyebrow}</p><h3>{content.visit.socialTitle}</h3></div><SocialLinks /></div>
        <nav className="local-guide-links" aria-label={isZh ? "卡加利火鍋相關資訊" : "Calgary hot pot resources"}>
          <strong>{isZh ? "卡加利火鍋相關資訊" : "Calgary Hot Pot Resources"}</strong>
          <div>{localGuideLinks.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}</div>
        </nav>
      </section>
    </main>
  );
}
