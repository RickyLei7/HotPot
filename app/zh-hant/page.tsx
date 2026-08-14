import { HomepageMenu } from "../homepage-menu";
import { makeZhMetadata, zhPages } from "./zh-page";

export const metadata = makeZhMetadata(zhPages.home);

export default function TraditionalChineseHomePage() {
  return (
    <>
      <link rel="preload" as="image" href="/assets/ayce-hotpot-720.webp" imageSrcSet="/assets/ayce-hotpot-480.webp 480w, /assets/ayce-hotpot-720.webp 720w, /assets/ayce-hotpot.webp 1024w" imageSizes="(max-width: 760px) calc(100vw - 32px), 42vw" />
      <HomepageMenu language="zh-Hant" />
    </>
  );
}
