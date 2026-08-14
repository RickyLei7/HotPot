import { HomepageMenu } from "../homepage-menu";
import { makeZhMetadata, zhPages } from "./zh-page";

export const metadata = makeZhMetadata(zhPages.home);

export default function TraditionalChineseHomePage() {
  return <HomepageMenu language="zh-Hant" />;
}
