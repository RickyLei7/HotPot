import { makeZhMetadata, ZhPage, zhPages } from "../zh-page";
export const metadata = makeZhMetadata(zhPages.restaurantInfo);
export default function TraditionalChineseRestaurantInfoPage() { return <ZhPage data={zhPages.restaurantInfo} />; }
