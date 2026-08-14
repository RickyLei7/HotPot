import Link from "next/link";
import { homepageContent, type HomepageLanguage } from "./homepage-content";
import { SiteNav } from "./site-nav";
import { SocialLinks } from "./social-links";

const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=2213+Centre+St+N+%232243%2C+Calgary%2C+AB+T2E+2T4";
const googleReviewUrl = "https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z/data=!3m1!4b1!4m6!3m5!1s0x537165667f6ee1f3:0x1a418403f487f9b3!8m2!3d51.0722307!4d-114.0630498!16s%2Fg%2F11bwndz8pj";

export function HomepageMenu({ language }: { language: HomepageLanguage }) {
  const isZh = language === "zh-Hant";
  const content = homepageContent[isZh ? "zhHant" : "en"];
  const menuPath = isZh ? "/zh-hant/menu/" : "/menu/";
  const aycePath = isZh ? "/zh-hant/ayce-hot-pot-calgary/" : "/ayce-hot-pot-calgary/";
  const snackImages = [
    { src: "/assets/ayce-fried-chicken-320.webp", srcSet: "/assets/ayce-fried-chicken-224.webp 224w, /assets/ayce-fried-chicken-320.webp 320w, /assets/ayce-fried-chicken-640.webp 640w" },
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
        <div className="homepage-ayce-media">
          <img src="/assets/ayce-hotpot.webp" alt={isZh ? "鼎鑽火鍋火鍋自助" : "AYCE hot pot at Centre Street Japanese HotPot"} width="1024" height="1536" fetchPriority="high" decoding="async" />
          <span>15 {isZh ? "款湯底" : "soup bases"}</span>
        </div>
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
        <div className="soup-preview-strip">
          <img src="/assets/personal-hot-pot-menu-full.webp" alt={isZh ? "鼎鑽火鍋完整個人火鍋菜單與 15 款湯底" : "Full personal hot pot menu with fifteen soup base choices at Centre Street Japanese HotPot"} width="1400" height="2096" loading="lazy" decoding="async" />
        </div>
      </section>

      <section id="beef-noodle" className="beef-noodle-feature">
        <div className="beef-noodle-feature-media">
          <img src="/assets/taiwanese-beef-noodle-story-720.webp" srcSet="/assets/taiwanese-beef-noodle-story-360.webp 360w, /assets/taiwanese-beef-noodle-story-480.webp 480w, /assets/taiwanese-beef-noodle-story-720.webp 720w" sizes="(max-width: 760px) 88vw, 520px" alt={content.beefNoodle.alt} width="1122" height="1402" loading="lazy" decoding="async" />
        </div>
        <div className="beef-noodle-feature-copy">
          <p className="eyebrow">{content.beefNoodle.eyebrow}</p>
          <h2>{content.beefNoodle.title}</h2>
          <strong className="menu-price">{content.beefNoodle.price}</strong>
          <h3>{content.beefNoodle.storyTitle}</h3>
          {content.beefNoodle.paragraphs.map((text) => <p key={text}>{text}</p>)}
        </div>
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
          <article><h3>{content.visit.hoursTitle}</h3>{content.visit.hours.map((hours) => <p key={hours}>{hours}</p>)}</article>
          <article><h3>{content.visit.contactTitle}</h3><p>{content.visit.contactCopy}</p><a href="tel:+14034553188">{content.visit.reserve}</a></article>
          <article><h3>{content.visit.directions}</h3><p>2213 Centre St N #2243, Calgary, AB T2E 2T4</p><a href={directionsUrl} target="_blank" rel="noreferrer">{content.visit.directions}</a></article>
          <article><h3>{content.visit.reviewTitle}</h3><p>{content.visit.reviewCopy}</p><a href={googleReviewUrl} target="_blank" rel="noreferrer">{content.visit.review}</a></article>
        </div>
        <div className="social-follow"><div><p className="eyebrow">{content.visit.socialEyebrow}</p><h3>{content.visit.socialTitle}</h3></div><SocialLinks /></div>
      </section>
    </main>
  );
}
