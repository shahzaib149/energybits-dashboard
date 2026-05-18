import { clsx } from "clsx";
import { AirtableValue, MonthlyReportsFields } from "@/lib/types";

export function cn(...values: Array<string | undefined | false | null>) {
  return clsx(values);
}

export function formatNumber(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCompactNumber(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function asText(value: AirtableValue): string {
  if (Array.isArray(value)) {
    return value.map((item) => asText(item as AirtableValue)).join(", ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function monthSortValue(record: MonthlyReportsFields) {
  const raw = record["Report Month"];

  if (!raw) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsed = new Date(raw);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getTime();
  }

  const normalized = Date.parse(`${raw} 1`);

  if (!Number.isNaN(normalized)) {
    return normalized;
  }

  return 0;
}

export function toNumber(value: AirtableValue): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}
