const numberFormatter = new Intl.NumberFormat("en-US");
const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

const dateShortFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return numberFormatter.format(value);
}

/** Always one decimal place (98.66 → "98.7%"). */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "0.0%";
  }
  return `${percentFormatter.format(value)}%`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return dateFormatter.format(date);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return dateShortFormatter.format(date);
}

export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPosition(value: number): string {
  if (!Number.isFinite(value)) return "0.0";
  return value.toFixed(1);
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  return currencyFormatter.format(value);
}

/** ROAS as ratio (6.88 → "6.88x"). */
export function formatRoas(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0.0x";
  return `${value.toFixed(2)}x`;
}

/** Compact currency for chart axes ($1.2K). */
export function formatCurrencyCompact(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}
