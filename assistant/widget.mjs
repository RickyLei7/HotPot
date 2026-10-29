// Shared by the static-site generator and React pages. All copy is maintained here.
export function widget(language = 'en') {
  const zh = language === 'zh-Hant';
  const c = zh ? {
    title:'菜單與訂位問題', intro:'想了解價格、湯底或訂位步驟？試試 AI 菜單助手。',
    privacy:'按「提問」後，問題會傳送至 OpenAI 處理。請勿輸入姓名、電話、電郵或訂位資料。',
    policy:'私隱說明', label:'你的問題', placeholder:'例如：兩位成人吃火鍋自助加小吃要多少錢？', ask:'提問',
    quick:['自助火鍋多少錢？','有甚麼湯底？','如何網上訂位？'],
    limits:'助手只提供已公布的餐廳資料，不能查詢即時空位、代為訂位或確認過敏原安全。',
    book:'網上訂位', menu:'查看菜單', call:'致電餐廳', disabled:'請啟用 JavaScript 使用助手，或直接查看菜單及網上訂位。'
  } : {
    title:'Menu & booking questions', intro:'Questions about prices, soups or booking? Try our AI menu helper.',
    privacy:'When you select Ask, your question is sent to OpenAI. Please leave out names, phone numbers, emails and reservation details.',
    policy:'Privacy details', label:'Your question', placeholder:'For example: How much is AYCE with snacks for 2 adults?', ask:'Ask',
    quick:['How much is AYCE?','What soup bases are there?','How do I book online?'],
    limits:'Uses published restaurant information. Cannot check live tables, make reservations or verify allergen safety.',
    book:'Book Online', menu:'View menu', call:'Call restaurant', disabled:'Enable JavaScript to use the helper, or use the menu and Book Online links below.'
  };
  const menu = zh ? '/zh-hant/menu/' : '/menu/';
  return `<section class="dining-helper" data-dining-helper data-language="${language}" aria-labelledby="dining-helper-title">
  <details>
    <summary id="dining-helper-title">${c.title}</summary>
    <div class="dining-helper-body">
      <p>${c.intro}</p>
      <p class="dining-helper-notice" id="dining-helper-privacy">${c.privacy} <a href="/privacy-policy/#ai-helper">${c.policy}</a></p>
      <form data-helper-form hidden>
        <label for="dining-helper-question">${c.label}</label>
        <textarea id="dining-helper-question" name="question" rows="3" maxlength="500" required placeholder="${c.placeholder}" aria-describedby="dining-helper-privacy dining-helper-limits"></textarea>
        <div class="dining-helper-quick">${c.quick.map(q => `<button type="button" data-helper-question="${q}">${q}</button>`).join('')}</div>
        <button class="dining-helper-submit" type="submit">${c.ask}</button>
      </form>
      <noscript><p>${c.disabled}</p></noscript>
      <p class="dining-helper-status" data-helper-status role="status" aria-live="polite"></p>
      <div class="dining-helper-answer" data-helper-answer tabindex="-1" aria-label="${zh ? '助手回覆' : 'Helper response'}" hidden></div>
      <p class="dining-helper-notice" id="dining-helper-limits">${c.limits}</p>
      <div class="dining-helper-actions">
        <a class="dining-helper-book" href="https://reservation.centrestjhotpot.ca/book" data-track-label="online_booking" aria-haspopup="dialog" data-reservation-launcher>${c.book}</a>
        <a href="${menu}">${c.menu}</a>
        <a href="tel:+14034553188">${c.call}</a>
      </div>
    </div>
  </details>
</section>`;
}
