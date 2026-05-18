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

  if (!open) {
    return null;
  }

  function handleFieldChange(field: EditableFieldDefinition, value: string) {
    setValues((current) => ({ ...current, [field.field]: value }));
    // Clear error when user starts typing
    if (errors[field.field]) {
      setErrors((current) => {
        const { [field.field]: _, ...rest } = current;
        return rest;
      });
    }
  }

  async function handleSubmit() {
    // Validate all fields
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const validation = validateFieldValue(field, values[field.field]);
      if (!validation.valid) {
        newErrors[field.field] = validation.error!;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      // Convert field values to appropriate types
      const convertedValues: Record<string, unknown> = {};
      fields.forEach((field) => {
        const rawValue = values[field.field];
        convertedValues[field.field] = convertFieldValue(field, rawValue);
      });

      await onSubmit(convertedValues);
      setValues({});
      setErrors({});
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setSubmitting(false);
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSubmit();
  }

  function renderFieldInput(field: EditableFieldDefinition, index: number) {
    const value = String(values[field.field] ?? "");
    const error = errors[field.field];

    if (field.type === "singleSelect" && field.options) {
      const options = getFieldOptions(field);
      return (
        <select
          autoFocus={index === 0}
          value={value}
          onChange={(event) => handleFieldChange(field, event.target.value)}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-slate-400 ${
            error ? "border-red-300" : "border-slate-200"
          }`}
        >
          <option value="">Select {field.label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "multilineText") {
      return (
        <textarea
          autoFocus={index === 0}
          value={value}
          onChange={(event) => handleFieldChange(field, event.target.value)}
          rows={3}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-slate-400 ${
            error ? "border-red-300" : "border-slate-200"
          }`}
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
      );
    }

    return (
      <input
        autoFocus={index === 0}
        type={
          field.type === "number"
            ? "number"
            : field.type === "url"
              ? "url"
              : field.type === "date"
                ? "date"
                : "text"
        }
        value={value}
        onChange={(event) => handleFieldChange(field, event.target.value)}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-slate-400 ${
          error ? "border-red-300" : "border-slate-200"
        }`}
        placeholder={`Enter ${field.label.toLowerCase()}`}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/40" onClick={onClose} />
      <form
        onSubmit={handleFormSubmit}
        className="fixed inset-x-0 bottom-0 top-4 z-50 mx-auto flex w-full max-w-2xl flex-col rounded-t-3xl bg-white shadow-2xl md:inset-0 md:top-auto md:max-h-[min(90vh,48rem)] md:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">New Record</p>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 p-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {fields.map((field, index) => (
            <label key={field.field} className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
              {renderFieldInput(field, index)}
              {errors[field.field] && (
                <span className="mt-1 block text-sm text-red-600">{errors[field.field]}</span>
              )}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Create Record
          </button>
        </div>
      </form>
    </>
  );
}
