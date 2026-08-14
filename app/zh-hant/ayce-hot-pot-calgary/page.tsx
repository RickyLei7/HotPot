import { makeZhMetadata, ZhPage, zhPages } from "../zh-page";
export const metadata = makeZhMetadata(zhPages.ayce);
export default function TraditionalChineseAycePage() { return <ZhPage data={zhPages.ayce} />; }
