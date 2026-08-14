import type { Metadata } from "next";
import { SiteNav } from "../site-nav";
import rawPages from "./page-data.json";

type Action = { label: string; href: string; style: string };
type Card = { title: string; text: string };
type Section = { eyebrow: string; title: string; paragraphs: string[]; cards?: Card[] };
type Faq = { question: string; answer: string };
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
  imageAlt: string;
  actions: Action[];
  facts: { value: string; label: string }[];
  sections: Section[];
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
  const graph: Record<string, unknown>[] = [
    {
      "@type": data.schemaType,
      "@id": `https://centrestjhotpot.ca${data.path}#webpage`,
      url: `https://centrestjhotpot.ca${data.path}`,
      name: data.title,
      description: data.description,
      inLanguage: "zh-Hant",
      isPartOf: { "@id": "https://centrestjhotpot.ca/#website" },
      about: { "@id": "https://centrestjhotpot.ca/#restaurant" },
    },
    {
      "@type": "Restaurant",
      "@id": "https://centrestjhotpot.ca/#restaurant",
      name: "Centre Street Japanese HotPot",
      alternateName: ["鼎鑽火鍋", "Centre Street Japanese Hotpot"],
      telephone: "+1-403-455-3188",
      address: { "@type": "PostalAddress", streetAddress: "2213 Centre St N #2243", addressLocality: "Calgary", addressRegion: "AB", postalCode: "T2E 2T4", addressCountry: "CA" },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "17:00", closes: "22:30" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "12:00", closes: "22:30" },
      ],
      hasMenu: "https://centrestjhotpot.ca/zh-hant/menu/",
      acceptsReservations: true,
    },
  ];
  if (data.faqs.length) graph.push({ "@type": "FAQPage", inLanguage: "zh-Hant", mainEntity: data.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) });
  return { "@context": "https://schema.org", "@graph": graph };
}

export function ZhPage({ data }: { data: ZhPageData }) {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFor(data)) }} />
      <SiteNav currentPath={data.path} language="zh-Hant" />
      <section className="localized-hero">
        <div className="localized-hero-copy">
          <p className="eyebrow">{data.eyebrow}</p><h1>{data.h1}</h1><p className="hero-text">{data.lead}</p>
          <div className="hero-actions">{data.actions.map((action) => <a className={action.style} href={action.href} key={action.label}>{action.label}</a>)}</div>
        </div>
        <div className="localized-hero-media"><img src={data.image} alt={data.imageAlt} width="900" height="675" fetchPriority="high" decoding="async" /></div>
      </section>
      <section className="quick-info" aria-label="餐廳重點">{data.facts.map((fact) => <div key={fact.label}><span>{fact.value}</span>{fact.label}</div>)}</section>
      {data.sections.map((section, index) => <section className={`content-section localized-section${index % 2 ? " is-dark" : ""}`} key={section.title}>
        <div className="section-heading compact"><p className="eyebrow">{section.eyebrow}</p><h2>{section.title}</h2></div>
        <div className="localized-copy">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        {section.cards?.length ? <div className="recommendation-grid localized-card-grid">{section.cards.map((card) => <article key={card.title}><h3>{card.title}</h3><p>{card.text}</p></article>)}</div> : null}
      </section>)}
      {data.faqs.length ? <section className="content-section localized-faq" id="faq"><div className="section-heading compact"><p className="eyebrow">常見問題</p><h2>快速找到用餐前需要的答案。</h2></div><div className="faq-list">{data.faqs.map((faq) => <article key={faq.question}><h2>{faq.question}</h2><p>{faq.answer}</p></article>)}</div></section> : null}
      <section className="localized-visit" id="visit"><div><p className="eyebrow">到店用餐</p><h2>2213 Centre St N #2243, Calgary</h2><p>週一至週五 17:00-22:30｜週六、週日 12:00-22:30</p></div><div className="hero-actions"><a className="primary-action" href="tel:+14034553188">致電 (403) 455-3188 訂位</a><a className="secondary-action" href="https://www.google.com/maps/dir/?api=1&destination=2213+Centre+St+N+%232243%2C+Calgary%2C+AB+T2E+2T4" target="_blank" rel="noreferrer">Google 地圖導航</a></div></section>
    </main>
  );
}
