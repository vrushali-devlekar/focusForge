/**
 * Calendar-day helpers.
 *
 * DailyStat.date is a Postgres DATE, which Prisma reads/writes as UTC midnight.
 * To keep "today" aligned with the user's own calendar (not the server's
 * timezone), the browser sends its local day as "yyyy-MM-dd" and the server
 * stores exactly that day as UTC midnight.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Local calendar day of `date` as "yyyy-MM-dd" (use in the browser) */
export function toDayKey(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Day key of a stored DATE value (ISO string or Date at UTC midnight) */
export function dayKeyOfStoredDate(value: string | Date): string {
  return (typeof value === "string" ? value : value.toISOString()).slice(0, 10);
}

/**
 * Parse a client-supplied day key into the UTC-midnight Date stored in DailyStat.
 * Only days within ±1 of the server's UTC day are accepted (every real timezone
 * falls in that window), so a client can't write focus time onto arbitrary dates.
 * Falls back to the server's current UTC day otherwise.
 */
export function parseDayKey(key: unknown): Date {
  const now = new Date();
  const serverDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (typeof key === "string" && DAY_KEY_PATTERN.test(key)) {
    const parsed = new Date(`${key}T00:00:00.000Z`);
    if (
      !Number.isNaN(parsed.getTime()) &&
      Math.abs(parsed.getTime() - serverDay.getTime()) <= DAY_MS
    ) {
      return parsed;
    }
  }
  return serverDay;
}

/** Shift a UTC-midnight day by whole days */
export function addDays(day: Date, amount: number): Date {
  return new Date(day.getTime() + amount * DAY_MS);
}
