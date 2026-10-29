// One shared chat UI for static pages and React routes. Opening never sends a request.
export const chatRoutes = ['', 'menu', 'contact', 'ayce-hot-pot-calgary', 'zh-hant', 'zh-hant/menu', 'zh-hant/contact', 'zh-hant/ayce-hot-pot-calgary'];
export const chatVersion = '20261029-iphone';
export function homeChatEntry(language = 'en') {
  return `<button class="home-chat-entry" type="button" data-chat-open hidden aria-controls="dining-chat-panel" aria-expanded="false">${language === 'zh-Hant' ? '有問題？餐廳小幫手' : 'Questions? Chat with us'}</button>`;
}
export function widget(language = 'en') {
  const zh = language === 'zh-Hant';
  const c = zh ? {
    title:'餐廳小幫手', intro:'你好！想了解菜單、價格或如何訂位？',
    notice:'自動回覆，需要店員協助可致電。',
    privacy:'訂位請按「網上訂位」，並在表格填寫姓名及電話。',
    policy:'私隱說明', label:'你的問題', placeholder:'例如：兩位成人加小吃要多少錢？', send:'傳送', close:'收起聊天',
    quick:['自助火鍋多少錢？','有甚麼湯底？','如何網上訂位？'],
    limits:'空位請在訂位表格查看；過敏原及特別安排請致電確認。',
    book:'網上訂位', menu:'查看菜單', call:'致電餐廳', disabled:'聊天需要 JavaScript。你也可以查看菜單、網上訂位或致電 (403) 455-3188。'
  } : {
    title:'Chat with us', intro:'Hi! Questions about the menu, prices or how to book?',
    notice:'Automated replies. Call us for staff help.',
    privacy:'To book, select Book Online and enter your name and phone number in the form.',
    policy:'Privacy details', label:'Your question', placeholder:'For example: AYCE with snacks for 2 adults?', send:'Send', close:'Minimize chat',
    quick:['How much is AYCE?','What soup bases are there?','How do I book online?'],
    limits:'Check available tables in Book Online. Call us about allergies or special requests.',
    book:'Book Online', menu:'View menu', call:'Call restaurant', disabled:'Chat needs JavaScript. You can still view the menu, book online or call (403) 455-3188.'
  };
  const menu = zh ? '/zh-hant/menu/' : '/menu/';
  return `<section class="dining-helper" data-dining-helper data-language="${language}" aria-label="${c.title}">
  <button class="dining-chat-launcher" type="button" data-chat-launcher data-chat-open hidden aria-controls="dining-chat-panel" aria-expanded="false">${c.title}</button>
  <button class="dining-chat-backdrop" type="button" data-chat-close hidden tabindex="-1" aria-label="${c.close}"></button>
  <div class="dining-chat-panel" id="dining-chat-panel" data-chat-panel role="dialog" aria-labelledby="dining-helper-title" aria-describedby="dining-chat-notice" tabindex="-1" hidden>
    <header class="dining-chat-header"><h2 id="dining-helper-title">${c.title}</h2><button class="dining-chat-close" type="button" data-chat-close aria-label="${c.close}">×</button></header>
    <p class="dining-chat-notice" id="dining-chat-notice">${c.notice}</p>
    <div class="dining-helper-actions">
      <a class="dining-helper-book" href="https://reservation.centrestjhotpot.ca/book" data-track-label="online_booking" aria-haspopup="dialog" data-reservation-launcher>${c.book}</a>
      <a href="tel:+14034553188">${c.call}</a><a href="${menu}">${c.menu}</a>
    </div>
    <div class="dining-chat-messages" data-chat-messages tabindex="0" aria-label="${zh ? '聊天記錄' : 'Chat messages'}">
      <p>${c.intro}</p>
      <div class="dining-helper-quick">${c.quick.map(q => `<button type="button" data-helper-question="${q}">${q}</button>`).join('')}</div>
      <p class="dining-helper-notice" id="dining-helper-limits">${c.limits}</p>
      <div class="dining-helper-answer" data-helper-answer hidden></div>
      <p class="dining-helper-status" data-helper-status role="status" aria-live="polite" aria-atomic="true"></p>
    </div>
    <form class="dining-chat-composer" data-helper-form hidden>
      <label for="dining-helper-question">${c.label}</label>
      <div class="dining-chat-input"><textarea id="dining-helper-question" name="question" rows="1" maxlength="500" required placeholder="${c.placeholder}" aria-describedby="dining-helper-privacy dining-helper-limits"></textarea><button class="dining-helper-submit" type="submit">${c.send}</button></div>
      <p class="dining-helper-notice" id="dining-helper-privacy"><span class="dining-helper-booking-hint">${c.privacy}</span> <a href="/privacy-policy/#ai-helper">${c.policy}</a></p>
    </form>
  </div>
  <noscript><p>${c.disabled} <a href="${menu}">${c.menu}</a></p></noscript>
</section>`;
}
