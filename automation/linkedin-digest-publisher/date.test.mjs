import assert from "node:assert/strict";
import test from "node:test";

import { previousDubaiDate } from "./date.mjs";

test("previous Dubai date respects the UTC+4 calendar boundary", () => {
  assert.equal(
    previousDubaiDate(new Date("2026-07-29T03:00:00Z")),
    "2026-07-28",
  );
  assert.equal(
    previousDubaiDate(new Date("2026-07-28T21:00:00Z")),
    "2026-07-28",
  );
  assert.equal(
    previousDubaiDate(new Date("2026-07-28T19:59:59Z")),
    "2026-07-27",
  );
});
