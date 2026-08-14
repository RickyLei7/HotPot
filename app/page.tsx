import { HomepageMenu } from "./homepage-menu";

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://centrestjhotpot.ca/#website",
      url: "https://centrestjhotpot.ca/",
      name: "Centre Street Japanese HotPot",
      alternateName: "鼎鑽火鍋",
      inLanguage: ["en-CA", "zh-Hant-CA"],
      publisher: { "@id": "https://centrestjhotpot.ca/#restaurant" },
    },
    {
      "@type": "WebPage",
      "@id": "https://centrestjhotpot.ca/#webpage",
      url: "https://centrestjhotpot.ca/",
      name: "Hot Pot Calgary | AYCE $28.99 & Personal Hot Pot $19.99",
      description: "Centre Street Japanese HotPot in Calgary serves $28.99 AYCE hot pot, complete $19.99 personal hot pot, Taiwanese beef noodle soup, light meals, snacks and milk tea.",
      inLanguage: "en-CA",
      isPartOf: { "@id": "https://centrestjhotpot.ca/#website" },
      about: { "@id": "https://centrestjhotpot.ca/#restaurant" },
      mainEntity: { "@id": "https://centrestjhotpot.ca/#restaurant" },
      primaryImageOfPage: { "@type": "ImageObject", url: "https://centrestjhotpot.ca/assets/dish-spicy.webp" },
    },
    {
      "@type": "Restaurant",
      "@id": "https://centrestjhotpot.ca/#restaurant",
      name: "Centre Street Japanese HotPot",
      alternateName: ["Centre Street Japanese Hotpot", "鼎鑽火鍋"],
      description: "Calgary restaurant serving $28.99 AYCE hot pot, $19.99 personal hot pot, Taiwanese beef noodle soup, rice and noodle meals, snacks, and milk tea.",
      url: "https://centrestjhotpot.ca/",
      logo: "https://centrestjhotpot.ca/assets/brand-logo-wide.webp",
      telephone: "+1-403-455-3188",
      email: "CentreStJHotpot@gmail.com",
      image: [
        "https://centrestjhotpot.ca/assets/dish-spicy.webp",
        "https://centrestjhotpot.ca/assets/soup-lineup.webp",
        "https://centrestjhotpot.ca/assets/light-meals/fried-chicken-rice-noodle-1024.webp",
      ],
      inLanguage: ["en-CA", "zh-Hant-CA"],
      servesCuisine: ["Taiwanese Hot Pot", "Japanese-style Hot Pot", "Hot Pot", "Taiwanese", "Bubble Tea"],
      priceRange: "$$",
      areaServed: { "@type": "City", name: "Calgary" },
      address: { "@type": "PostalAddress", streetAddress: "2213 Centre St N #2243", addressLocality: "Calgary", addressRegion: "AB", postalCode: "T2E 2T4", addressCountry: "CA" },
      geo: { "@type": "GeoCoordinates", latitude: 51.0722307, longitude: -114.0630498 },
      hasMap: "https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z",
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "17:00", closes: "22:30" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "12:00", closes: "22:30" },
      ],
      menu: "https://centrestjhotpot.ca/menu/",
      hasMenu: "https://centrestjhotpot.ca/menu/",
      acceptsReservations: true,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Centre Street Japanese HotPot dining options",
        itemListElement: [
          { "@type": "Offer", name: "Personal Hot Pot", price: "19.99", priceCurrency: "CAD", description: "Includes one of 15 soup bases, one large vegetable set, one meat, and one rice or noodle side." },
          { "@type": "Offer", name: "All-You-Can-Eat Hot Pot", price: "28.99", priceCurrency: "CAD", description: "Soup base included with AAA beef, lamb, pork, or chicken ordered through the server." },
          { "@type": "Offer", name: "All-You-Can-Eat Snacks Upgrade", price: "3.99", priceCurrency: "CAD", description: "Optional 19-snack all-you-can-eat upgrade per person. Everyone at the same table must upgrade." },
          { "@type": "Offer", name: "Solo Hot Pot Combo", price: "24.99", priceCurrency: "CAD", description: "One personal hot pot and one drink." },
          { "@type": "Offer", name: "Couple Hot Pot Combo", price: "58.99", priceCurrency: "CAD", description: "Two personal hot pots, two drinks, and one appetizer." },
        ],
      },
      potentialAction: { "@type": "ReserveAction", target: { "@type": "EntryPoint", urlTemplate: "tel:+14034553188", actionPlatform: "https://schema.org/MobileWebPlatform" }, result: { "@type": "Reservation", name: "Table reservation" } },
      sameAs: [
        "https://www.instagram.com/centrestreetjapanesehotpot/",
        "https://www.facebook.com/CentreStreetJapaneseHotPot",
        "https://www.threads.com/@centrestreetjapanesehotpot",
        "https://www.tiktok.com/@stjapanesehotpot",
        "https://www.xiaohongshu.com/user/profile/65408e340000000030030828",
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <link rel="preload" as="image" href="/assets/ayce-hotpot.webp" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }} />
      <HomepageMenu language="en" />
    </>
  );
}
