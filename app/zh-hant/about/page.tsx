import { makeZhMetadata, ZhPage, zhPages } from "../zh-page";
export const metadata = makeZhMetadata(zhPages.about);
export default function TraditionalChineseAboutPage() { return <ZhPage data={zhPages.about} />; }
