import type { Metadata } from "next";
import { SiteNav } from "../site-nav";
import rawPages from "./page-data.json";

type Action = { label: string; href: string; style: string };
type Card = { title: string; text: string; href?: string; actionLabel?: string };
type Section = { eyebrow: string; title: string; paragraphs: string[]; cards?: Card[]; actions?: Action[] };
type Faq = { question: string; answer: string };
type FeatureStory = { eyebrow: string; title: string; image: string; imageAlt: string; paragraphs: string[] };
export type ZhPageData = {
  path: string;
  englishPath: string;
  schemaType: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  image: string;
  imageFull?: string;
  imageActionLabel?: string;
  imageAlt: string;
  actions: Action[];
  facts: { value: string; label: string }[];
  sections: Section[];
  featureStory?: FeatureStory;
  faqs: Faq[];
};

export const zhPages = rawPages as Record<string, ZhPageData>;

export function makeZhMetadata(data: ZhPageData): Metadata {
  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: data.path,
      languages: { "en-CA": data.englishPath, "zh-Hant-CA": data.path, "x-default": data.englishPath },
    },
    openGraph: {
      title: data.title,
      description: data.description,
      url: `https://centrestjhotpot.ca${data.path}`,
      locale: "zh_CA",
      alternateLocale: ["en_CA"],
      images: [data.image],
      type: data.schemaType === "Article" ? "article" : "website",
    },
  };
}

function schemaFor(data: ZhPageData) {
  const faqMainEntity = data.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } }));
  const pageEntity: Record<string, unknown> = {
    "@type": data.schemaType,
    "@id": `https://centrestjhotpot.ca${data.path}#webpage`,
    url: `https://centrestjhotpot.ca${data.path}`,
    name: data.title,
    description: data.description,
    inLanguage: "zh-Hant-CA",
    isPartOf: { "@id": "https://centrestjhotpot.ca/#website" },
    about: { "@id": "https://centrestjhotpot.ca/#restaurant" },
  };
  if (data.schemaType === "FAQPage") pageEntity.mainEntity = faqMainEntity;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": "https://centrestjhotpot.ca/#website",
      url: "https://centrestjhotpot.ca/",
      name: "Centre Street Japanese HotPot",
      alternateName: "鼎鑽火鍋",
      inLanguage: ["en-CA", "zh-Hant-CA"],
      publisher: { "@id": "https://centrestjhotpot.ca/#restaurant" },
    },
    pageEntity,
    {
      "@type": "Restaurant",
      "@id": "https://centrestjhotpot.ca/#restaurant",
      name: "Centre Street Japanese HotPot",
      alternateName: ["鼎鑽火鍋", "Centre Street Japanese Hotpot"],
      url: "https://centrestjhotpot.ca/",
      logo: "https://centrestjhotpot.ca/assets/brand-logo-wide.webp",
      image: [
        "https://centrestjhotpot.ca/assets/dish-spicy.webp",
        "https://centrestjhotpot.ca/assets/soup-lineup.webp",
        "https://centrestjhotpot.ca/assets/light-meals/fried-chicken-rice-noodle-1024.webp",
      ],
      inLanguage: ["en-CA", "zh-Hant-CA"],
      telephone: "+1-403-455-3188",
      email: "CentreStJHotpot@gmail.com",
      servesCuisine: ["台式火鍋", "日式風格火鍋", "一人一鍋", "台式小吃", "奶茶"],
      priceRange: "$$",
      areaServed: { "@type": "City", name: "Calgary" },
      address: { "@type": "PostalAddress", streetAddress: "2213 Centre St N #2243", addressLocality: "Calgary", addressRegion: "AB", postalCode: "T2E 2T4", addressCountry: "CA" },
      geo: { "@type": "GeoCoordinates", latitude: 51.0722307, longitude: -114.0630498 },
      hasMap: "https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z",
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "17:00", closes: "22:30" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "12:00", closes: "22:30" },
      ],
      menu: "https://centrestjhotpot.ca/zh-hant/menu/",
      hasMenu: "https://centrestjhotpot.ca/zh-hant/menu/",
      acceptsReservations: true,
    },
  ];
  if (data.faqs.length && data.schemaType !== "FAQPage") graph.push({ "@type": "FAQPage", "@id": `https://centrestjhotpot.ca${data.path}#faq`, inLanguage: "zh-Hant-CA", mainEntity: faqMainEntity });
  return { "@context": "https://schema.org", "@graph": graph };
}

export function ZhPage({ data }: { data: ZhPageData }) {
  return (
    <main id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFor(data)) }} />
      <SiteNav currentPath={data.path} language="zh-Hant" />
      <section className="localized-hero">
        <div className="localized-hero-copy">
          <p className="eyebrow">{data.eyebrow}</p><h1>{data.h1}</h1><p className="hero-text">{data.lead}</p>
          <div className="hero-actions">{data.actions.map((action) => <a className={action.style} href={action.href} key={action.label}>{action.label}</a>)}</div>
        </div>
        {data.imageFull && data.imageActionLabel ? <a className="localized-hero-media poster-thumbnail" href="#localized-menu-poster" aria-label={data.imageActionLabel}><img src={data.image} alt={data.imageAlt} width="480" height="622" fetchPriority="high" decoding="async" /><strong className="poster-open-label">{data.imageActionLabel}</strong></a> : <div className="localized-hero-media"><img src={data.image} alt={data.imageAlt} width="900" height="675" fetchPriority="high" decoding="async" /></div>}
      </section>
      {data.imageFull && data.imageActionLabel ? <section className="poster-modal" id="localized-menu-poster" role="dialog" aria-modal="true" aria-labelledby="localized-menu-poster-title" data-close-target="top"><a className="modal-backdrop" href="#top" aria-label="關閉完整菜單" /><div className="poster-frame"><span className="modal-label" id="localized-menu-poster-title">完整火鍋自助菜單</span><a className="modal-close" href="#top" aria-label="關閉完整菜單">關閉</a><img src={data.imageFull} alt={data.imageAlt} width="1200" height="1553" loading="lazy" decoding="async" /></div></section> : null}
      <section className="quick-info" aria-label="餐廳重點">{data.facts.map((fact) => <div key={fact.label}><span>{fact.value}</span>{fact.label}</div>)}</section>
      {data.sections.map((section, index) => <section className={`content-section localized-section${index % 2 ? " is-dark" : ""}`} key={section.title}>
        <div className="section-heading compact"><p className="eyebrow">{section.eyebrow}</p><h2>{section.title}</h2></div>
        <div className="localized-copy">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        {section.actions?.length ? <div className="menu-download-actions localized-section-actions">{section.actions.map((action) => <a className={action.style} href={action.href} key={action.label} target="_blank" rel="noreferrer">{action.label}</a>)}</div> : null}
        {section.cards?.length ? <div className="recommendation-grid localized-card-grid">{section.cards.map((card) => <article key={card.title}><h3>{card.title}</h3><p>{card.text}</p>{card.href && card.actionLabel ? <a className="card-action" href={card.href} target="_blank" rel="noreferrer">{card.actionLabel}</a> : null}</article>)}</div> : null}
      </section>)}
      {data.featureStory ? <section className="beef-noodle-story" aria-label="台灣傳統牛肉麵故事">
        <div className="beef-noodle-story-media"><img src={data.featureStory.image} alt={data.featureStory.imageAlt} width="1122" height="1402" loading="lazy" decoding="async" /></div>
        <div className="beef-noodle-story-copy"><p className="eyebrow">{data.featureStory.eyebrow}</p><h2>{data.featureStory.title}</h2><div className="story-language">{data.featureStory.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div>
      </section> : null}
      {data.faqs.length ? <section className="content-section localized-faq" id="faq"><div className="section-heading compact"><p className="eyebrow">常見問題</p><h2>快速找到用餐前需要的答案</h2></div><div className="faq-list">{data.faqs.map((faq) => <article key={faq.question}><h2>{faq.question}</h2><p>{faq.answer}</p></article>)}</div></section> : null}
      <section className="localized-visit" id="visit"><div><p className="eyebrow">到店用餐</p><h2>2213 Centre St N #2243, Calgary</h2><p>週一至週五 17:00-22:30｜週六、週日 12:00-22:30</p></div><div className="hero-actions"><a className="primary-action" href="tel:+14034553188">致電 (403) 455-3188 訂位</a><a className="secondary-action" href="https://www.google.com/maps/dir/?api=1&destination=2213+Centre+St+N+%232243%2C+Calgary%2C+AB+T2E+2T4" target="_blank" rel="noreferrer">Google 地圖導航</a></div></section>
    </main>
  );
}
