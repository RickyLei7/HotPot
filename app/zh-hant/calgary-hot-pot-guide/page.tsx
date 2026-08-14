import { makeZhMetadata, ZhPage, zhPages } from "../zh-page";
export const metadata = makeZhMetadata(zhPages.hotPotGuide);
export default function TraditionalChineseHotPotGuidePage() { return <ZhPage data={zhPages.hotPotGuide} />; }
