export const formatDateToDDMMYYYY = (date: string | Date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateToMMDDYYYY = (date: string | Date) => {
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${month}/${day}/${year}`;
};
export function toUTCISOString(date: string | Date | undefined) {
  if (!date) return undefined;
  const d = toDate(date);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
}

/**
 * Turn just about anything into a Date instance.
 *  • JS timestamps (ms or s) or numeric strings
 *  • "dd/mm/yy" , "dd-mm-yy[/]"           (2- or 4-digit year)
 *  • native Date-parsable strings (ISO, RFC-2822…)
 *  • Firebase Timestamp:
 *      ─ sdk instance   → has .toDate()
 *      ─ plain object   → {seconds, nanoseconds}
 */
export function toDate(input) {
  // 0) Firebase Timestamp (SDK instance)
  if (input && typeof input.toDate === 'function') {
    return input.toDate();
  }

  // 1) Firebase Timestamp (plain object shape)
  if (input && typeof input === 'object' && typeof input._seconds === 'number') {
    const { _seconds, _nanoseconds = 0 } = input;
    return new Date(_seconds * 1000 + Math.round(_nanoseconds / 1e6));
  }

  // 2) Numeric (timestamp in ms or s, or numeric string)
  const n = Number(input);
  if (!Number.isNaN(n)) {
    const ms = n < 1e12 ? n * 1000 : n; // heuristic: < 1 000 000 000 000 ⇒ seconds
    return new Date(ms);
  }

  // 3) Custom d/m/y or d-m-y patterns
  const m = String(input)
    .trim()
    .match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\/?$/);
  if (m) {
    let [, d, mo, y] = m.map(Number);
    if (y < 100) y += 2000; // map 2-digit years ➜ 20yy
    return new Date(y, mo - 1, d); // month is 0-based
  }

  // 4) Let built-in Date try (ISO, RFC-2822, etc.)
  const native = new Date(input);
  if (!Number.isNaN(native)) return native;

  throw new Error(`Unrecognised date-like value: ${input}`);
}

/**
 * Format a date (or anything accepted by toDate) as "dd/mm/yy".
 */
export function toDMY(dateLike) {
  const d = dateLike instanceof Date ? dateLike : toDate(dateLike);
  return d;
}

export function toTimestamp(input: string | Date) {
  const d = input instanceof Date ? input : toDate(input);
  return {
    _seconds: Math.floor(d.getTime() / 1000),
    _nanoseconds: (d.getTime() % 1000) * 1e6,
  };
}

// For sending to backend
export const toApiDate = (date: string | Date) => formatDateToMMDDYYYY(toDate(date));

// For showing in UI
export const toUiDate = (date: string | Date) => formatDateToDDMMYYYY(toDate(date));
