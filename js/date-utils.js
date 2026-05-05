import { MS_PER_DAY } from "./constants.js";

export const longDateFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export const monthFormatter = new Intl.DateTimeFormat("es-CO", {
  month: "long",
  year: "numeric",
});

export const unlockedDateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function getMondayBasedWeekday(date) {
  return (date.getDay() + 6) % 7;
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function daysBetween(firstDate, secondDate) {
  return Math.round((stripTime(secondDate) - stripTime(firstDate)) / MS_PER_DAY);
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatDateKey(dateKey) {
  return unlockedDateFormatter.format(parseDateKey(dateKey));
}

export function formatDaysLabel(days) {
  return `${days} ${days === 1 ? "día" : "días"}`;
}

export function isDateKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return toDateKey(parseDateKey(value)) === value;
}

export function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
