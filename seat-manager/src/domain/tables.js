export const RESTAURANT_TABLES = Object.freeze([
  { id: 1, capacity: 4 }, { id: 2, capacity: 4 }, { id: 3, capacity: 4 },
  { id: 4, capacity: 6 }, { id: 5, capacity: 6 },
  { id: 6, capacity: 4 }, { id: 7, capacity: 4 }, { id: 8, capacity: 4 },
  { id: 9, capacity: 2 }, { id: 10, capacity: 2 }
]);

export const formatTableCardNumber = tableId => String(tableId);
export const formatTableReference = tableIds => `桌位 ${tableIds.join(' + ')}`;
