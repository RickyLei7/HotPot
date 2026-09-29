import { HomepageMenu } from "../homepage-menu";
import { makeZhMetadata, zhPages } from "./zh-page";

export const metadata = makeZhMetadata(zhPages.home);

export default function TraditionalChineseHomePage() {
  return (
    <>
      <link rel="preload" as="image" href="/assets/dish-sukiyaki-640.webp" imageSrcSet="/assets/dish-sukiyaki-320.webp 320w, /assets/dish-sukiyaki-640.webp 640w, /assets/dish-sukiyaki.webp 1024w" imageSizes="(max-width: 760px) calc(100vw - 32px), 42vw" />
      <HomepageMenu language="zh-Hant" />
    </>
  );
}
