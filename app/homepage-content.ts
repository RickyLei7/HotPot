export type HomepageLanguage = "en" | "zh-Hant";

export type MealCard = {
  slug: string;
  name: string;
  price: string;
  description: string;
  alt: string;
};

export type HomepageContent = {
  navPath: string;
  ayce: {
    eyebrow: string;
    title: string;
    lead: string;
    detail: string;
    reserve: string;
    menu: string;
    snackEyebrow: string;
    snackTitle: string;
    snackLead: string;
    snackRule: string;
    individualNote: string;
    snackNames: string[];
  };
  personal: {
    eyebrow: string;
    title: string;
    lead: string;
    inclusions: string[];
    splitPot: string;
    comboNote: string;
    menu: string;
  };
  beefNoodle: {
    eyebrow: string;
    title: string;
    price: string;
    storyTitle: string;
    paragraphs: string[];
    alt: string;
  };
  lightMeals: {
    eyebrow: string;
    title: string;
    lead: string;
    items: MealCard[];
    menu: string;
  };
  drinks: {
    eyebrow: string;
    title: string;
    lead: string;
    discount: string;
    categories: Array<{ name: string; price: string }>;
    alt: string;
  };
  visit: {
    eyebrow: string;
    title: string;
    hoursTitle: string;
    hours: string[];
    details: string;
    contactTitle: string;
    contactCopy: string;
    reserve: string;
    directions: string;
    reviewTitle: string;
    reviewCopy: string;
    review: string;
    socialEyebrow: string;
    socialTitle: string;
  };
};

const englishMeals: MealCard[] = [
  { slug: "braised-pork-rice", name: "Braised Pork Rice", price: "$12.99", description: "Braised pork over steamed rice", alt: "Taiwanese braised pork rice at Centre Street Japanese HotPot in Calgary" },
  { slug: "fried-chicken-rice-noodle", name: "Taiwanese Fried Chicken Rice or Noodle", price: "$14.99", description: "Crispy Taiwanese fried chicken served with rice or noodles", alt: "Taiwanese fried chicken rice at Centre Street Japanese HotPot in Calgary" },
  { slug: "wonton-rice-noodle", name: "Wonton Soup with Rice or Noodle", price: "$14.99", description: "Wontons in warm broth served with rice or noodles", alt: "Wonton soup with rice at Centre Street Japanese HotPot in Calgary" },
  { slug: "unagi-rice", name: "Unagi Rice Bowl", price: "$18.99", description: "Grilled unagi over steamed rice", alt: "Unagi rice bowl at Centre Street Japanese HotPot in Calgary" },
  { slug: "beef-brisket-rice", name: "Beef Brisket Rice", price: "$16.99", description: "Tender braised beef brisket over rice", alt: "Beef brisket rice at Centre Street Japanese HotPot in Calgary" },
  { slug: "sukiyaki-beef-rice", name: "Sukiyaki Beef Rice", price: "$16.99", description: "Sliced beef cooked in sweet sukiyaki sauce over rice", alt: "Sukiyaki beef rice at Centre Street Japanese HotPot in Calgary" },
];

const chineseMeals: MealCard[] = [
  { slug: "braised-pork-rice", name: "台式滷肉飯", price: "$12.99", description: "香濃滷肉配白飯", alt: "鼎鑽火鍋台式滷肉飯" },
  { slug: "fried-chicken-rice-noodle", name: "台式鹽酥雞或雞排飯麵", price: "$14.99", description: "酥脆鹽酥雞或雞排搭配白飯或麵", alt: "鼎鑽火鍋台式鹽酥雞飯" },
  { slug: "wonton-rice-noodle", name: "雲吞湯飯或麵", price: "$14.99", description: "暖心雲吞湯搭配白飯或麵", alt: "鼎鑽火鍋雲吞湯飯" },
  { slug: "unagi-rice", name: "日式蒲燒鰻魚飯", price: "$18.99", description: "蒲燒鰻魚配熱白飯", alt: "鼎鑽火鍋日式蒲燒鰻魚飯" },
  { slug: "beef-brisket-rice", name: "紅燒牛腩飯", price: "$16.99", description: "軟嫩入味的紅燒牛腩配白飯", alt: "鼎鑽火鍋紅燒牛腩飯" },
  { slug: "sukiyaki-beef-rice", name: "日式壽喜燒牛肉飯", price: "$16.99", description: "香甜壽喜燒牛肉配白飯", alt: "鼎鑽火鍋日式壽喜燒牛肉飯" },
];

export const homepageContent: { en: HomepageContent; zhHant: HomepageContent } = {
  en: {
    navPath: "/",
    ayce: {
      eyebrow: "All-you-can-eat hot pot in Calgary",
      title: "$28.99 AYCE Hot Pot",
      lead: "Choose 1 of 15 soup bases. Order AAA beef, lamb, pork, or chicken through your server.",
      detail: "Your soup base is included. Come for a relaxed family dinner, a table with friends, or a group meal on Centre Street.",
      reserve: "Book Online",
      menu: "See AYCE Details",
      snackEyebrow: "Add snacks",
      snackTitle: "+$5.99: 19 AYCE Snacks",
      snackLead: "Add Taiwanese fried chicken, takoyaki, crispy chicken cutlet, golden fried buns, crispy squid legs, and more.",
      snackRule: "The upgrade is +$5.99 per person, and everyone at the table must join.",
      individualNote: "Prefer a few? Order snacks à la carte.",
      snackNames: ["Signature Taiwanese Fried Chicken", "Takoyaki", "Crispy Chicken Cutlet", "Golden Fried Buns", "Crispy Squid Legs"],
    },
    personal: {
      eyebrow: "One pot, one complete meal",
      title: "$19.99 Personal Hot Pot",
      lead: "$19.99 includes your choice of 15 soup bases, one large vegetable set, one meat, and one rice or noodle side.",
      inclusions: ["Choose 1 of 15 soup bases", "1 large vegetable set", "1 meat: AAA beef, lamb, pork, or chicken", "1 rice or noodle side"],
      splitPot: "Want two broths? Upgrade to a split pot for +$2.",
      comboNote: "Also available: $24.99 Solo Combo with one drink, or $58.99 Couple Combo with two personal hot pots, two drinks, and one appetizer.",
      menu: "See Personal Hot Pot Menu",
    },
    beefNoodle: {
      eyebrow: "A comforting Taiwanese classic",
      title: "Signature Traditional Taiwanese Beef Noodle Soup",
      price: "$16.99",
      storyTitle: "A Bowl That Feels Like Home",
      paragraphs: [
        "For many of us, beef noodle soup tastes like home: a hot bowl after school, on a rainy day, or around the family table.",
        "Ours brings together slow-simmered broth, tender braised beef, and noodles that soak up every bit of flavour.",
      ],
      alt: "Traditional Taiwanese braised beef noodle soup at Centre Street Japanese HotPot",
    },
    lightMeals: {
      eyebrow: "More than hot pot",
      title: "Taiwanese Rice & Noodle Bowls",
      lead: "Want something quick and warm? Choose a rice or noodle bowl.",
      items: englishMeals,
      menu: "View the Full Menu",
    },
    drinks: {
      eyebrow: "Tea, milk tea and more",
      title: "Choose Your Drink",
      lead: "Choose your sweetness and ice level. Tea and milk tea can also be prepared hot.",
      discount: "Enjoy 10% off drinks with any hot pot or signature meal.",
      categories: [
        { name: "Classic Teas", price: "$4.95" }, { name: "Flavoured Black or Green Tea", price: "$5.95" },
        { name: "Milk Teas", price: "$5.95" }, { name: "Sea Salt Cream Tea", price: "$6.95" },
        { name: "Specialty Teas", price: "$5.95" }, { name: "Yogurt Drinks", price: "$5.95" },
        { name: "Smoothies", price: "$7.95" }, { name: "Specialty Sodas", price: "$6.95" },
        { name: "Soft Drinks", price: "$2.00" },
      ],
      alt: "Milk tea and colourful drinks at Centre Street Japanese HotPot",
    },
    visit: {
      eyebrow: "Visit Centre Street Japanese HotPot",
      title: "2213 Centre St N #2243, Calgary",
      hoursTitle: "Hours",
      hours: ["Monday-Friday 5:00 PM-10:30 PM", "Saturday-Sunday 12:00 PM-10:30 PM"],
      details: "Full Restaurant Details",
      contactTitle: "Reserve your table",
      contactCopy: "Book online, or call us about groups and today's availability.",
      reserve: "Book Online",
      directions: "Google Maps Directions",
      reviewTitle: "Share Your Visit",
      reviewCopy: "Tell other Calgary diners on Google.",
      review: "Review Us on Google",
      socialEyebrow: "Follow and find us",
      socialTitle: "New Dishes and Restaurant Updates",
    },
  },
  zhHant: {
    navPath: "/zh-hant/",
    ayce: {
      eyebrow: "卡加利火鍋自助",
      title: "$28.99 火鍋自助",
      lead: "15 款湯底任選，AAA 牛肉、羊肉、豬肉或雞肉由服務員協助下單。",
      detail: "鍋底已包含在價格內，適合家庭聚餐、朋友相聚與多人用餐。",
      reserve: "網上訂位",
      menu: "查看自助詳情",
      snackEyebrow: "加點小吃",
      snackTitle: "+$5.99：19 款小吃任點",
      snackLead: "可點鹽酥雞、章魚小丸子、香酥雞排、黃金炸饅頭、酥炸魷魚鬚等小吃。",
      snackRule: "升級費每位 +$5.99，同桌客人須一起升級。",
      individualNote: "不升級也可單點小吃。",
      snackNames: ["招牌台式鹽酥雞", "章魚小丸子", "香酥雞排", "黃金炸饅頭", "酥炸魷魚鬚"],
    },
    personal: {
      eyebrow: "一人一鍋 剛好一餐",
      title: "$19.99 個人火鍋",
      lead: "$19.99 包含 15 款湯底任選一款、一份大份菜盤、一份肉和一份主食。",
      inclusions: ["15 款湯底任選一款", "一份大份菜盤", "一份肉可選 AAA 牛肉 羊肉 豬肉或雞肉", "一份主食可選白飯或麵"],
      splitPot: "想同時吃兩款湯底，可加 $2 升級鴛鴦鍋。",
      comboNote: "另有 $24.99 單人套餐配一杯飲料，以及 $58.99 雙人套餐配兩杯飲料和一份小吃。",
      menu: "查看個人火鍋菜單",
    },
    beefNoodle: {
      eyebrow: "讓人想起家的經典味道",
      title: "招牌台式紅燒牛肉麵",
      price: "$16.99",
      storyTitle: "一碗讓人想起家的台灣傳統牛肉麵",
      paragraphs: [
        "對很多人來說，牛肉麵就是家的味道：放學後、下雨天，或一家人坐下吃飯時，來一碗最剛好。",
        "慢火熬出的湯頭，配上軟嫩牛肉和吸滿湯汁的麵條，簡單又暖胃。",
      ],
      alt: "鼎鑽火鍋慢火燉煮的台灣傳統紅燒牛肉麵",
    },
    lightMeals: {
      eyebrow: "不只火鍋",
      title: "台式招牌飯麵",
      lead: "想吃得快又有飽足感，可選台式飯麵。",
      items: chineseMeals,
      menu: "查看完整菜單",
    },
    drinks: {
      eyebrow: "茶飲 奶茶與特色飲品",
      title: "選一杯喜歡的飲料",
      lead: "甜度和冰量都可以選擇，茶飲與奶茶也可以做熱飲。",
      discount: "任點火鍋或招牌餐點 飲料可享九折優惠",
      categories: [
        { name: "經典茶飲", price: "$4.95" }, { name: "調味紅茶或綠茶", price: "$5.95" },
        { name: "奶茶系列", price: "$5.95" }, { name: "海鹽奶蓋系列", price: "$6.95" },
        { name: "特調茶飲", price: "$5.95" }, { name: "優格飲品", price: "$5.95" },
        { name: "冰沙系列", price: "$7.95" }, { name: "特調氣泡飲", price: "$6.95" },
        { name: "汽水", price: "$2.00" },
      ],
      alt: "鼎鑽火鍋奶茶與特色飲品",
    },
    visit: {
      eyebrow: "到店用餐",
      title: "位於卡加利 Centre Street",
      hoursTitle: "營業時間",
      hours: ["週一至週五 5:00 PM-10:30 PM", "週六及週日 12:00 PM-10:30 PM"],
      details: "查看完整餐廳資料",
      contactTitle: "預訂座位",
      contactCopy: "可網上訂位；團體聚餐或查詢今天座位，也可直接致電。",
      reserve: "網上訂位",
      directions: "Google 地圖導航",
      reviewTitle: "分享用餐體驗",
      reviewCopy: "歡迎在 Google 分享用餐體驗。",
      review: "前往 Google 留下評論",
      socialEyebrow: "追蹤我們",
      socialTitle: "新菜品 優惠與店內消息",
    },
  },
};
