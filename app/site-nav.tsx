import Link from "next/link";
import { languagePair, localizedPath, type SiteLanguage } from "./language-routes";

type SiteNavProps = {
  currentPath?: string;
  language?: SiteLanguage;
};

export function SiteNav({ currentPath = "/", language = "en" }: SiteNavProps) {
  const pair = languagePair(currentPath);
  const isZhHant = language === "zh-Hant";
  const labels = isZhHant
    ? { home: "首頁", ayce: "火鍋自助", menu: "菜單", more: "更多", about: "關於我們", faq: "常見問題", contact: "聯絡與地址", visit: "到店資訊", reserve: "訂位" }
    : { home: "Home", ayce: "AYCE", menu: "Menu", more: "More", about: "About", faq: "FAQ", contact: "Contact", visit: "Visit", reserve: "Reserve" };

  return (
    <nav className="site-nav" aria-label={isZhHant ? "主要導覽" : "Main navigation"}>
      <Link className="brand-mark" href={localizedPath("/", language)} aria-label={isZhHant ? "鼎鑽火鍋首頁" : "Centre Street Japanese Hotpot home"}>
        <img
          src="/assets/brand-logo-wide-300.webp"
          srcSet="/assets/brand-logo-wide-300.webp 300w, /assets/brand-logo-wide-480.webp 480w, /assets/brand-logo-wide.webp 600w"
          sizes="(max-width: 760px) 52vw, 260px"
          alt="Centre Street Japanese Hotpot"
          width="600"
          height="184"
        />
      </Link>
      <div className="nav-links">
        <Link href={localizedPath("/", language)}>{labels.home}</Link>
        <Link href={localizedPath("/ayce-hot-pot-calgary/", language)}>{labels.ayce}</Link>
        <Link href={localizedPath("/menu/", language)}>{labels.menu}</Link>
        <details className="nav-more">
          <summary>{labels.more}</summary>
          <div className="nav-more-links">
            <Link href={localizedPath("/about/", language)}>{labels.about}</Link>
            <Link href={localizedPath("/faq/", language)}>{labels.faq}</Link>
            <Link href={localizedPath("/contact/", language)}>{labels.contact}</Link>
            <Link href={`${localizedPath("/", language)}#visit`}>{labels.visit}</Link>
          </div>
        </details>
      </div>
      <div className="language-switch" aria-label={isZhHant ? "切換網站語言" : "Switch website language"}>
        <Link className={`language-option${!isZhHant ? " is-active" : ""}`} aria-current={!isZhHant ? "page" : undefined} href={pair.en}>EN</Link>
        <Link className={`language-option${isZhHant ? " is-active" : ""}`} aria-current={isZhHant ? "page" : undefined} href={pair.zhHant}>中文</Link>
      </div>
      <a className="nav-call" href="tel:+14034553188">
        {labels.reserve}
      </a>
    </nav>
  );
}
