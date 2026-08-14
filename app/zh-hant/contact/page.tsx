import { makeZhMetadata, ZhPage, zhPages } from "../zh-page";
export const metadata = makeZhMetadata(zhPages.contact);
export default function TraditionalChineseContactPage() { return <ZhPage data={zhPages.contact} />; }
