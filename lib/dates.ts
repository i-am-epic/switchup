import { formatInTimeZone, toDate } from "date-fns-tz";
import { addDays, nextMonday, parseISO } from "date-fns";

export function getTimezone(): string {
  return (
    process.env.NEXT_PUBLIC_APP_TIMEZONE ||
    process.env.APP_TIMEZONE ||
    "Asia/Kolkata"
  );
}

/** Calendar date YYYY-MM-DD in app timezone */
export function getToday(timezone = getTimezone()): string {
  return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
}

export function toDateOnly(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return formatInTimeZone(value, "UTC", "yyyy-MM-dd");
}

/** Calendar date for a full timestamp in the app timezone */
export function toZonedDateOnly(
  value: string | Date,
  timezone = getTimezone(),
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return formatInTimeZone(date, timezone, "yyyy-MM-dd");
}

/** Parse YYYY-MM-DD into a Date at UTC midnight for Prisma @db.Date */
export function parseDateOnly(value: string): Date {
  return parseISO(`${value.slice(0, 10)}T00:00:00.000Z`);
}

export function addDaysToDateOnly(dateOnly: string, days: number): string {
  const d = parseISO(`${dateOnly}T00:00:00.000Z`);
  return formatInTimeZone(addDays(d, days), "UTC", "yyyy-MM-dd");
}

export function nextMondayFrom(dateOnly: string): string {
  const d = parseISO(`${dateOnly}T00:00:00.000Z`);
  return formatInTimeZone(nextMonday(d), "UTC", "yyyy-MM-dd");
}

export function daysUntil(from: string, to: string): number {
  const a = toDate(`${from}T00:00:00.000Z`, { timeZone: "UTC" }).getTime();
  const b = toDate(`${to}T00:00:00.000Z`, { timeZone: "UTC" }).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}
