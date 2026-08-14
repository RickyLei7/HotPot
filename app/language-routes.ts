export type SiteLanguage = "en" | "zh-Hant";

const englishToTraditionalChinese = {
  "/": "/zh-hant/",
  "/about/": "/zh-hant/about/",
  "/menu/": "/zh-hant/menu/",
  "/faq/": "/zh-hant/faq/",
  "/contact/": "/zh-hant/contact/",
  "/restaurant-info/": "/zh-hant/restaurant-info/",
  "/calgary-hot-pot-guide/": "/zh-hant/calgary-hot-pot-guide/",
  "/calgary-taiwanese-hot-pot/": "/zh-hant/calgary-taiwanese-hot-pot/",
  "/first-time-hot-pot-calgary/": "/zh-hant/first-time-hot-pot-calgary/",
  "/ayce-hot-pot-calgary/": "/zh-hant/ayce-hot-pot-calgary/",
} as const;

function normalizePath(pathname: string) {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function languagePair(pathname: string) {
  const normalized = normalizePath(pathname);
  const englishPath = normalized.startsWith("/zh-hant/")
    ? normalized.replace(/^\/zh-hant/, "") || "/"
    : normalized;
  const zhHantPath = englishToTraditionalChinese[englishPath as keyof typeof englishToTraditionalChinese]
    || "/zh-hant/";
  return { en: englishPath, zhHant: zhHantPath };
}

export function localizedPath(pathname: string, language: SiteLanguage) {
  const pair = languagePair(pathname);
  return language === "zh-Hant" ? pair.zhHant : pair.en;
}
