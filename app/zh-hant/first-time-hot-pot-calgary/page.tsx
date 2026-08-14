import { makeZhMetadata, ZhPage, zhPages } from "../zh-page";
export const metadata = makeZhMetadata(zhPages.firstTime);
export default function TraditionalChineseFirstTimeHotPotPage() { return <ZhPage data={zhPages.firstTime} />; }
