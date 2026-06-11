"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { EditableFieldDefinition } from "@/lib/types";
import { convertFieldValue, getFieldOptions, validateFieldValue } from "@/lib/editing";

export function NewRecordModal({
  open,
  title,
  fields,
  onClose,
  onSubmit
}: {
  open: boolean;
  title: string;
  fields: EditableFieldDefinition[];
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setValues({});
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  function handleFieldChange(field: EditableFieldDefinition, value: string) {
    setValues((current) => ({ ...current, [field.field]: value }));
    if (errors[field.field]) {
      setErrors((current) => {
        const { [field.field]: _, ...rest } = current;
        return rest;
      });
    }
  }

  async function handleSubmit() {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const validation = validateFieldValue(field, values[field.field]);
      if (!validation.valid) newErrors[field.field] = validation.error!;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const convertedValues: Record<string, unknown> = {};
      fields.forEach((field) => {
        convertedValues[field.field] = convertFieldValue(field, values[field.field]);
      });
      await onSubmit(convertedValues);
      setValues({});
      setErrors({});
    } catch {
      // Error handling done in parent
    } finally {
      setSubmitting(false);
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSubmit();
  }

  const inputBase =
    "w-full rounded-lg border bg-surfaceElevated px-4 py-2.5 text-sm text-textPrimary placeholder:text-textMuted outline-none focus:border-brand";

  function renderFieldInput(field: EditableFieldDefinition, index: number) {
    const value = String(values[field.field] ?? "");
    const error = errors[field.field];
    const cls = `${inputBase} ${error ? "border-red-500" : "border-border"}`;

    if (field.type === "singleSelect" && field.options) {
      const options = getFieldOptions(field);
      return (
        <select
          autoFocus={index === 0}
          value={value}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          className={cls}
        >
          <option value="">Select {field.label}</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (field.type === "multilineText") {
      return (
        <textarea
          autoFocus={index === 0}
          value={value}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          rows={3}
          className={cls}
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
      );
    }

    return (
      <input
        autoFocus={index === 0}
        type={
          field.type === "number" ? "number"
          : field.type === "url" ? "url"
          : field.type === "date" ? "date"
          : "text"
        }
        value={value}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        className={cls}
        placeholder={`Enter ${field.label.toLowerCase()}`}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleFormSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-lg flex-col rounded-2xl border border-border bg-surface shadow-2xl"
        style={{ maxHeight: "min(90vh, 44rem)" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-textMuted">New Record</p>
            <h3 className="mt-0.5 text-xl font-semibold text-textPrimary">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-2 text-textMuted hover:bg-surfaceElevated hover:text-textPrimary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {fields.map((field, index) => (
            <label key={field.field} className="block">
              <span className="mb-1.5 block text-sm font-medium text-textSecondary">
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
              </span>
              {renderFieldInput(field, index)}
              {errors[field.field] && (
                <span className="mt-1 block text-xs text-red-400">{errors[field.field]}</span>
              )}
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-textSecondary hover:bg-surfaceElevated"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brandHover disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
