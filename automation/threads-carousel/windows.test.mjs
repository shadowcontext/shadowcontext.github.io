import assert from "node:assert/strict";
import test from "node:test";

import { DateTime } from "luxon";

import { calculateDubaiWindow, isInWindow } from "./windows.mjs";

const dubai = (value) => DateTime.fromISO(value, { setZone: true });

test("00-12 uses the current Dubai calendar morning", () => {
  const window = calculateDubaiWindow({
    now: dubai("2026-07-25T12:05:00+04:00"),
    requestedWindow: "00-12",
  });
  assert.equal(window.startIso, "2026-07-25T00:00:00.000+04:00");
  assert.equal(window.endIso, "2026-07-25T12:00:00.000+04:00");
});

test("12-00 uses the current Dubai afternoon when run after noon", () => {
  const window = calculateDubaiWindow({
    now: dubai("2026-07-25T18:00:00+04:00"),
    requestedWindow: "12-00",
  });
  assert.equal(window.startIso, "2026-07-25T12:00:00.000+04:00");
  assert.equal(window.endIso, "2026-07-26T00:00:00.000+04:00");
});

test("automatic midnight run selects the previous calendar day's 12-00 window", () => {
  const window = calculateDubaiWindow({
    now: dubai("2026-07-26T00:05:00+04:00"),
  });
  assert.equal(window.name, "12-00");
  assert.equal(window.startIso, "2026-07-25T12:00:00.000+04:00");
  assert.equal(window.endIso, "2026-07-26T00:00:00.000+04:00");
});

test("window intervals include their start and exclude their end", () => {
  const morning = calculateDubaiWindow({
    now: dubai("2026-07-25T12:05:00+04:00"),
    requestedWindow: "00-12",
  });
  const afternoon = calculateDubaiWindow({
    now: dubai("2026-07-25T12:05:00+04:00"),
    requestedWindow: "12-00",
  });

  assert.equal(isInWindow(dubai("2026-07-25T00:00:00+04:00"), morning), true);
  assert.equal(isInWindow(dubai("2026-07-25T12:00:00+04:00"), morning), false);
  assert.equal(isInWindow(dubai("2026-07-25T12:00:00+04:00"), afternoon), true);
  assert.equal(
    isInWindow(dubai("2026-07-26T00:00:00+04:00"), afternoon),
    false,
  );
});
