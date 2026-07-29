const DUBAI_ZONE = "Asia/Dubai";

function calendarParts(date, timeZone) {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return values;
}

export function previousDubaiDate(now = new Date()) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error("now must be a valid Date");
  }
  const { year, month, day } = calendarParts(now, DUBAI_ZONE);
  return new Date(Date.UTC(year, month - 1, day) - 86_400_000)
    .toISOString()
    .slice(0, 10);
}
