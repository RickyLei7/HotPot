import { makeZhMetadata, ZhPage, zhPages } from "../zh-page";
export const metadata = makeZhMetadata(zhPages.taiwaneseHotPot);
export default function TraditionalChineseTaiwaneseHotPotPage() { return <ZhPage data={zhPages.taiwaneseHotPot} />; }
