import test from "node:test";
import assert from "node:assert/strict";
import {
  daysBetween,
  learnedInterval,
  suggestInterval,
  toItemView,
  sortItemViews,
} from "../src/domain.mjs";

test("daysBetween handles month and year boundaries in UTC", () => {
  assert.equal(daysBetween("2025-12-31", "2026-01-02"), 2);
});

test("learnedInterval uses the median of the five newest gaps", () => {
  const dates = ["2026-08-01", "2026-08-04", "2026-08-08", "2026-08-12", "2026-08-19", "2026-08-23"];
  assert.equal(learnedInterval(dates), 4);
});

test("learnedInterval stays null before three records", () => {
  assert.equal(learnedInterval(["2026-09-01", "2026-09-05"]), null);
});

test("suggestion requires two days and twenty percent difference", () => {
  assert.equal(suggestInterval(7, 5), 5);
  assert.equal(suggestInterval(10, 9), null);
  assert.equal(suggestInterval(30, 28), null);
});

test("manual interval controls due date while learning remains visible", () => {
  const view = toItemView(
    { id: 1, name: "Beef rolls", manual_interval_days: 7, notes: "", active: 1 },
    ["2026-09-01", "2026-09-05", "2026-09-10"],
    "2026-09-13",
  );
  assert.equal(view.learnedIntervalDays, 5);
  assert.equal(view.effectiveIntervalDays, 7);
  assert.equal(view.dueDate, "2026-09-17");
  assert.equal(view.daysUntilDue, 4);
});

test("items sort by due date and learning items stay after dated items", () => {
  const sorted = sortItemViews([
    { id: 1, dueDate: null, daysUntilDue: null, name: "Learning" },
    { id: 2, dueDate: "2026-09-20", daysUntilDue: 7, name: "Later" },
    { id: 3, dueDate: "2026-09-12", daysUntilDue: -1, name: "Overdue" },
  ]);
  assert.deepEqual(sorted.map((item) => item.id), [3, 2, 1]);
});
