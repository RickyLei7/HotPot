import { HomepageMenu } from "../homepage-menu";
import { makeZhMetadata, zhPages } from "./zh-page";

export const metadata = makeZhMetadata(zhPages.home);

export default function TraditionalChineseHomePage() {
  return (
    <>
      <link rel="preload" as="image" href="/assets/ayce-menu-2026-08-25-fast-720.webp" imageSrcSet="/assets/ayce-menu-2026-08-25-fast-480.webp 480w, /assets/ayce-menu-2026-08-25-fast-720.webp 720w, /assets/ayce-menu-2026-08-24-599.webp 1200w" imageSizes="(max-width: 760px) calc(100vw - 32px), 42vw" />
      <HomepageMenu language="zh-Hant" />
    </>
  );
}
