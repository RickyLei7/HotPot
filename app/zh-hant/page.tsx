import { makeZhMetadata, ZhPage, zhPages } from "./zh-page";
export const metadata = makeZhMetadata(zhPages.home);
export default function TraditionalChineseHomePage() { return <ZhPage data={zhPages.home} />; }
