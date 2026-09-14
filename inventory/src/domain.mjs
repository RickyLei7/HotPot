const DAY_MS = 86_400_000;

export function parseISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid date");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("Invalid date");
  }
  return date;
}

export function daysBetween(fromISO, toISO) {
  return Math.round((parseISODate(toISO) - parseISODate(fromISO)) / DAY_MS);
}

export function learnedInterval(orderDates) {
  const dates = [...new Set(orderDates)].sort();
  if (dates.length < 3) return null;
  const gaps = dates.slice(1).map((date, index) => daysBetween(dates[index], date)).slice(-5).sort((a, b) => a - b);
  const middle = Math.floor(gaps.length / 2);
  return gaps.length % 2 ? gaps[middle] : Math.round((gaps[middle - 1] + gaps[middle]) / 2);
}

export function suggestInterval(manualDays, learnedDays) {
  if (!manualDays || !learnedDays) return null;
  const difference = Math.abs(manualDays - learnedDays);
  return difference >= 2 && difference / manualDays >= 0.2 ? learnedDays : null;
}

function addDays(dateISO, days) {
  return new Date(parseISODate(dateISO).valueOf() + days * DAY_MS).toISOString().slice(0, 10);
}

export function toItemView(item, orderDates, todayISO) {
  const dates = [...new Set(orderDates)].sort();
  const lastOrderDate = dates.at(-1) ?? null;
  const learnedIntervalDays = learnedInterval(dates);
  const effectiveIntervalDays = item.manual_interval_days ?? learnedIntervalDays;
  const dueDate = lastOrderDate && effectiveIntervalDays ? addDays(lastOrderDate, effectiveIntervalDays) : null;
  const daysUntilDue = dueDate ? daysBetween(todayISO, dueDate) : null;
  const status = daysUntilDue === null ? "learning" : daysUntilDue < 0 ? "overdue" : daysUntilDue === 0 ? "today" : daysUntilDue <= 3 ? "soon" : "later";
  return {
    id: item.id,
    name: item.name,
    notes: item.notes ?? "",
    active: Boolean(item.active),
    manualIntervalDays: item.manual_interval_days ?? null,
    learnedIntervalDays,
    suggestedIntervalDays: suggestInterval(item.manual_interval_days, learnedIntervalDays),
    effectiveIntervalDays,
    lastOrderDate,
    daysSinceOrder: lastOrderDate ? daysBetween(lastOrderDate, todayISO) : null,
    dueDate,
    daysUntilDue,
    status,
  };
}

export function sortItemViews(items) {
  return [...items].sort((a, b) => {
    if (a.dueDate === null) return b.dueDate === null ? a.name.localeCompare(b.name) : 1;
    if (b.dueDate === null) return -1;
    return a.dueDate.localeCompare(b.dueDate) || a.name.localeCompare(b.name);
  });
}
