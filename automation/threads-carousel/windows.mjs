import { DateTime } from "luxon";
import { DUBAI_ZONE } from "./config.mjs";

const WINDOW_NAMES = new Set(["auto", "00-12", "12-00"]);

export function calculateDubaiWindow({
  now = DateTime.now(),
  requestedWindow = "auto",
} = {}) {
  if (!WINDOW_NAMES.has(requestedWindow)) {
    throw new Error(
      `Unsupported window "${requestedWindow}"; expected auto, 00-12, or 12-00`,
    );
  }

  const localNow = DateTime.isDateTime(now)
    ? now.setZone(DUBAI_ZONE)
    : DateTime.fromISO(String(now), { setZone: true }).setZone(DUBAI_ZONE);
  if (!localNow.isValid)
    throw new Error(`Invalid current time: ${localNow.invalidExplanation}`);

  const resolvedWindow =
    requestedWindow === "auto"
      ? localNow.hour < 12
        ? "12-00"
        : "00-12"
      : requestedWindow;

  let windowDate = localNow.startOf("day");
  if (resolvedWindow === "12-00" && localNow.hour < 12) {
    windowDate = windowDate.minus({ days: 1 });
  }

  const start =
    resolvedWindow === "00-12" ? windowDate : windowDate.plus({ hours: 12 });
  const end =
    resolvedWindow === "00-12"
      ? windowDate.plus({ hours: 12 })
      : windowDate.plus({ days: 1 });

  return {
    name: resolvedWindow,
    timezone: DUBAI_ZONE,
    localDate: windowDate.toISODate(),
    start,
    end,
    startIso: start.toISO(),
    endIso: end.toISO(),
  };
}

export function isInWindow(publishedAt, window) {
  const instant = DateTime.isDateTime(publishedAt)
    ? publishedAt
    : DateTime.fromISO(String(publishedAt), { setZone: true });
  if (!instant.isValid) return false;
  return (
    instant.toMillis() >= window.start.toMillis() &&
    instant.toMillis() < window.end.toMillis()
  );
}
