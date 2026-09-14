export function orderRecordedMessage(itemName, orderDate, todayISO) {
  return orderDate === todayISO
    ? `已记录「${itemName}」今天叫货`
    : `已记录「${itemName}」${orderDate} 叫货`;
}

export function loginFailureMessage(error) {
  if (error.status === 401) return "密码不正确";
  if (error.status === 429) return "尝试次数过多，请稍后再试";
  return "暂时无法登录，请稍后重试";
}
