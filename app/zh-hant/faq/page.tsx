import { makeZhMetadata, ZhPage, zhPages } from "../zh-page";
export const metadata = makeZhMetadata(zhPages.faq);
export default function TraditionalChineseFaqPage() { return <ZhPage data={zhPages.faq} />; }
