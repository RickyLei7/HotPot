export function orderRecordedMessage(itemName, orderDate, todayISO) {
  return orderDate === todayISO
    ? `已记录「${itemName}」今天叫货`
    : `已记录「${itemName}」${orderDate} 叫货`;
}
