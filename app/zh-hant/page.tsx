import { HomepageMenu } from "../homepage-menu";
import { makeZhMetadata, zhPages } from "./zh-page";

export const metadata = makeZhMetadata(zhPages.home);

export default function TraditionalChineseHomePage() {
  return (
    <>
      <link rel="preload" as="image" fetchPriority="high" href="/assets/dish-sukiyaki-640.webp" imageSrcSet="/assets/dish-sukiyaki-320.webp 320w, /assets/dish-sukiyaki-640.webp 640w, /assets/dish-sukiyaki-768.webp 768w, /assets/dish-sukiyaki-1024-perf.webp 1024w" imageSizes="(max-width: 760px) calc(100vw - 32px), 42vw" />
      <HomepageMenu language="zh-Hant" />
    </>
  );
}
