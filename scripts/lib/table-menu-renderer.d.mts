export interface BilingualText {
  en: string;
  zh: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: BilingualText;
  description?: BilingualText;
  serving?: BilingualText;
  price?: string;
  priceRequired?: boolean;
  imageId: string;
  tags?: string[];
  available: boolean;
  variants?: MenuItem[];
  metadata?: unknown;
}

export interface TableMenu {
  version: string;
  currency: string;
  defaultLanguage: "en";
  languages: ["en", "zh"];
  notices: { order: BilingualText; images: BilingualText };
  featuredOrder: string[];
  categories: Array<{ id: string; name: BilingualText }>;
  items: MenuItem[];
}

export function escapeHtml(value: unknown): string;
export function renderTableMenuMarkup(menu: TableMenu): string;
export function renderTableMenuJsonLd(menu: TableMenu, canonicalUrl: string): Record<string, unknown>;
