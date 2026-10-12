// One date formatter for the whole site. Dates are stored as ISO calendar
// days ('2026-04-14') and always formatted in UTC, so the build machine's
// timezone can never move an announcement to the day before or after.
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const parts = (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Invalid ISO date "${iso}" — expected YYYY-MM-DD`);
  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11 || Number(day) < 1 || Number(day) > 31) {
    throw new Error(`Invalid ISO date "${iso}"`);
  }
  return { year, monthIndex, day: Number(day) };
};

/** '2026-04-14' → '14 April 2026' */
export const formatDate = (iso: string) => {
  const { year, monthIndex, day } = parts(iso);
  return `${day} ${MONTHS[monthIndex]} ${year}`;
};

/** '2026-04-14' → '14 APR 2026' — for readouts. */
export const formatDateShort = (iso: string) => {
  const { year, monthIndex, day } = parts(iso);
  return `${String(day).padStart(2, '0')} ${MONTHS[monthIndex].slice(0, 3).toUpperCase()} ${year}`;
};
