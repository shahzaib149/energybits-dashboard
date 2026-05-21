export interface CSVColumn<T> {
  key: keyof T;
  label: string;
  format?: (value: T[keyof T]) => string;
}

export function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCSV<T>(data: T[], columns: CSVColumn<T>[]): string {
  const header = columns.map((c) => escapeCSV(c.label)).join(",");
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const raw = row[c.key];
        const formatted = c.format ? c.format(raw) : String(raw ?? "");
        return escapeCSV(formatted);
      })
      .join(",")
  );
  return `\uFEFF${[header, ...rows].join("\n")}`;
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
