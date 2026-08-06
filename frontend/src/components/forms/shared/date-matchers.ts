import type { Matcher } from "react-day-picker";

/** Combines `minDate`/`maxDate`/`disabledDates` into a single react-day-picker `Matcher[]`, shared by `DatePicker` and `DateRangePicker`. */
export function buildDisabledMatcher(options: {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[] | ((date: Date) => boolean);
}): Matcher[] {
  const matchers: Matcher[] = [];
  if (options.minDate) matchers.push({ before: options.minDate });
  if (options.maxDate) matchers.push({ after: options.maxDate });
  if (typeof options.disabledDates === "function") {
    matchers.push(options.disabledDates);
  } else if (Array.isArray(options.disabledDates)) {
    matchers.push(...options.disabledDates);
  }
  return matchers;
}
