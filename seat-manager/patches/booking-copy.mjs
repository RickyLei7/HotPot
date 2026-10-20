import assert from 'node:assert/strict';

// Copy only: fail closed when the reviewed release text no longer matches.
function replaceCopy(source, replacements) {
  for (const [before, after] of replacements) {
    assert(source.includes(before), `Booking copy anchor missing: ${before}`);
    source = source.replaceAll(before, after);
  }
  return source;
}

export const bookingClientCopy = source => replaceCopy(source, [
  ['Send request / 提交申請', 'Request a table / 提交訂位'],
  ["new Option('Select time','')", "new Option('Select time / 選擇時間','')"],
  ['Booking request received / 已收到訂位申請', 'Booking request received / 已收到訂位'],
  ['Not confirmed yet — no table is held. / 訂位尚未確認，座位未保留。', 'Awaiting restaurant confirmation. No table is held yet. / 待餐廳確認，座位尚未保留。'],
  ["awaiting?'We received your request.'", "awaiting?'Please wait for restaurant confirmation.'"],
  ["awaiting?'已收到您的申請。'", "awaiting?'請等候餐廳確認。'"],
  ['Private link copied. / 已複製私人網址。', 'Booking link copied. / 已複製訂位連結。'],
  ['Open “View / manage booking” and bookmark the page. / 請打開管理訂位頁並加入書籤。', 'Open “View / edit booking” and bookmark the page. / 請打開「查看／修改訂位」並加入書籤。'],
  ['This private link is invalid or expired. Call 403-455-3188. / 私人網址無效或已過期，請來電。', 'This booking link is invalid or expired. Call 403-455-3188. / 訂位連結無效或已過期，請來電。'],
  ['Confirming / 確認中…', 'Processing… / 正在處理…'],
]);

export const bookingHtmlCopy = source => replaceCopy(source, [
  ['<option value="">Select time</option>', '<option value="">Select time / 選擇時間</option>'],
  ['Try again / 重試</button>', 'Check times again / 重新查看時段</button>'],
  ['Mobile <span lang="zh-Hant">電話</span>', 'Mobile <span lang="zh-Hant">手機號碼</span>'],
  ['Sit together, guest count unsure / 希望坐一起、人数不确定等。', 'Seating preferences or other requests / 座位偏好或其他需要'],
  ['Subject to confirmation · <span lang="zh-Hant">盡量安排，以店內確認為準</span>', 'Special requests are not guaranteed · <span lang="zh-Hant">特殊安排會盡量配合，恕不保證</span>'],
  ['Request only · <span lang="zh-Hant">訂位申請，待本店確認</span>', 'Restaurant confirmation required · <span lang="zh-Hant">此訂位須由餐廳確認</span>'],
  ['Updates / <span lang="zh-Hant">推薦</span>', 'Recommended / <span lang="zh-Hant">建議選擇</span>'],
  ['id="booking-hold-policy">Held 10 min after booking time. <span lang="zh-Hant">訂位時間後為您保留10分鐘。</span>', 'id="booking-hold-policy">Once confirmed, your table is held until 10 min after your booking time. <span lang="zh-Hant">訂位確認後，座位保留至訂位時間後10分鐘。</span>'],
  ['Keep this private link · 請保留此私人網址。', 'Keep this link private · 請保留訂位連結，勿轉發他人。'],
  ['Copy link / 複製網址', 'Copy booking link / 複製訂位連結'],
  ['>Edit / 修改</button>', '>Edit booking / 修改訂位</button>'],
  ['>Cancel / 取消訂位</button>', '>Cancel booking / 取消訂位</button>'],
  ['Keep it / 保留訂位', 'Keep booking / 保留訂位'],
  ['Keep original / 返回原訂位', 'Back to booking / 返回訂位詳情'],
]);
