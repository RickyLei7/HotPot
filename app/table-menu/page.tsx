import type { Metadata } from "next";
import menu from "../../content/table-menu/menu.json";
import {
  renderTableMenuJsonLd,
  renderTableMenuMarkup,
  type TableMenu,
} from "../../scripts/lib/table-menu-renderer.mjs";

const canonicalUrl = "https://centrestjhotpot.ca/table-menu/";
const tableMenu = menu as TableMenu;

export const metadata: Metadata = {
  title: "Table Menu | Centre Street Japanese HotPot",
  description: "View-only bilingual dine-in menu for Centre Street Japanese HotPot. Please order with your server.",
  alternates: { canonical: "/table-menu/" },
  openGraph: {
    title: "Table Menu | Centre Street Japanese HotPot",
    description: "Browse our dine-in menu in English or Traditional Chinese.",
    url: canonicalUrl,
    images: ["/assets/table-menu/ayce-individual-640.webp"],
    type: "website",
  },
};

export default function TableMenuPage() {
  const markup = renderTableMenuMarkup(tableMenu);
  const jsonLd = JSON.stringify(renderTableMenuJsonLd(tableMenu, canonicalUrl)).replaceAll("<", "\\u003c");

  return (
    <>
      <link rel="stylesheet" href="/table-menu/table-menu.css" />
      <style>{`body:has(.table-menu) > .reserve-sticky { display: none; }`}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <script defer src="/table-menu/table-menu.js" />
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </>
  );
}
