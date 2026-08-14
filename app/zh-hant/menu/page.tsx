import { makeZhMetadata, ZhPage, zhPages } from "../zh-page";
export const metadata = makeZhMetadata(zhPages.menu);
export default function TraditionalChineseMenuPage() { return <ZhPage data={zhPages.menu} />; }
