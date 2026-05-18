"use client";

import { Badge } from "@/components/Badge";
import { CheckboxEditor } from "@/components/editors/CheckboxEditor";
import { DateEditor } from "@/components/editors/DateEditor";
import { DateTimeEditor } from "@/components/editors/DateTimeEditor";
import { InlineTextEditor } from "@/components/editors/InlineTextEditor";
import { MultiSelectEditor } from "@/components/editors/MultiSelectEditor";
import { MultilineEditor } from "@/components/editors/MultilineEditor";
import { NumberEditor } from "@/components/editors/NumberEditor";
import { SelectEditor } from "@/components/editors/SelectEditor";
import { UrlEditor } from "@/components/editors/UrlEditor";
import { SaveStatus } from "@/hooks/useEditableRecord";
import { EditableFieldDefinition } from "@/lib/types";
import { asText, formatDate } from "@/lib/utils";
export function EditableCell({
  definition,
  value,
  status,
  onSave,
  displayContext
}: {
  definition?: EditableFieldDefinition;
  value: unknown;
  status: SaveStatus;
  onSave: (value: any) => Promise<any> | void;
  displayContext?: "priority" | "searchIntent" | "blogStatus" | "seoStatus" | "contentStatus" | "aeoStatus" | "platform" | "generic";
}) {
  if (!definition) {
    return <span>{asText(value as any) || "—"}</span>;
  }

  const disabled = false;

  switch (definition.type) {
    case "singleLineText":
      return <InlineTextEditor value={typeof value === "string" ? value : ""} disabled={disabled} status={status} onSave={onSave} />;
    case "multilineText":
      return <MultilineEditor value={typeof value === "string" ? value : ""} disabled={disabled} status={status} onSave={onSave} />;
    case "singleSelect":
      return (
        <SelectEditor
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          status={status}
          options={definition.options ?? []}
          context={displayContext}
          onSave={onSave}
        />
      );
    case "multipleSelects":
      return (
        <MultiSelectEditor
          value={Array.isArray(value) ? (value as string[]) : []}
          disabled={disabled}
          status={status}
          options={definition.options ?? []}
          onSave={onSave}
        />
      );
    case "number":
      return (
        <NumberEditor
          value={typeof value === "number" ? value : undefined}
          disabled={disabled}
          precision={definition.precision ?? 0}
          status={status}
          onSave={onSave}
        />
      );
    case "date":
      return <DateEditor value={typeof value === "string" ? value : ""} disabled={disabled} status={status} onSave={onSave} />;
    case "dateTime":
      return <DateTimeEditor value={typeof value === "string" ? value : ""} disabled={disabled} status={status} onSave={onSave} />;
    case "checkbox":
      return <CheckboxEditor value={Boolean(value)} disabled={disabled} status={status} onSave={onSave} />;
    case "url":
      return <UrlEditor value={typeof value === "string" ? value : ""} disabled={disabled} status={status} onSave={onSave} />;
    default:
      return (
        <span>{typeof value === "string" && definition.type === "date" ? formatDate(value) : asText(value as any) || "—"}</span>
      );
  }
}

export function ReadOnlyBadgeCell({ value, context }: { value?: string; context?: any }) {
  return <Badge value={value} context={context} />;
}
