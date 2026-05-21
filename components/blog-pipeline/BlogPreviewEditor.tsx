"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { InlineTextEditor } from "@/components/editors/InlineTextEditor";
import { MultilineEditor } from "@/components/editors/MultilineEditor";
import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";
import { getBlogPreviewImage } from "@/lib/blogImages";
import { formatBlogPreviewDate, getBlogPreviewSource, renderBlogContent } from "@/lib/blogPreview";
import { COPY } from "@/lib/copy";
import { AirtableRecord, AirtableValue, BlogPipelineFields } from "@/lib/types";
import { asText } from "@/lib/utils";

type BlogRecord = AirtableRecord<BlogPipelineFields>;

const TITLE_DISPLAY_CLASS =
  "block w-full rounded-lg px-0 py-0 text-left text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl disabled:cursor-default";
const TITLE_INPUT_CLASS =
  "w-full rounded-lg border border-blue-300 bg-white px-2 py-1 text-4xl font-semibold tracking-tight text-slate-950 outline-none sm:text-5xl";
const META_DISPLAY_CLASS = "line-clamp-3 text-lg leading-8 text-slate-600";

function MetaLine({ value }: { value?: string }) {
  if (!value) return null;
  return <span className="text-sm text-slate-500">{value}</span>;
}

function bodyDraftField(record: BlogRecord): "Human Edited Draft" | "AI Draft" {
  return asText(record.fields["Human Edited Draft"]).trim() ? "Human Edited Draft" : "AI Draft";
}

export function BlogPreviewEditor({
  initialRecord,
  canEdit
}: {
  initialRecord: BlogRecord;
  canEdit: boolean;
}) {
  const copy = COPY.blogPipeline.previewEdit;
  const [record, setRecord] = useState(initialRecord);
  const [statuses, setStatuses] = useState<Record<string, SaveStatus>>({});
  const [editingBody, setEditingBody] = useState(false);
  const [bodyDraft, setBodyDraft] = useState("");

  const bodyField = useMemo(() => bodyDraftField(record), [record]);
  const bodyValue = asText(record.fields[bodyField]);
  const renderedHtml = useMemo(() => renderBlogContent(getBlogPreviewSource(record)), [record]);
  const previewImage = getBlogPreviewImage(record);

  const authorLine = record.fields["Author Name"] ? `By ${asText(record.fields["Author Name"])}` : undefined;
  const rawDate = record.fields["Published Date"] || record.fields["Scheduled Publish Date"];
  const dateLine = rawDate ? formatBlogPreviewDate(rawDate) : undefined;
  const showMeta = Boolean(authorLine || dateLine);

  function getFieldStatus(fieldName: string): SaveStatus {
    return statuses[fieldName] ?? "idle";
  }

  function setFieldStatus(fieldName: string, status: SaveStatus) {
    setStatuses((current) => ({ ...current, [fieldName]: status }));
  }

  async function savePreviewFields(fields: Record<string, AirtableValue>) {
    const fieldNames = Object.keys(fields);
    fieldNames.forEach((name) => setFieldStatus(name, "saving"));

    const previousRecord = record;
    setRecord((current) => ({
      ...current,
      fields: { ...current.fields, ...fields }
    }));

    try {
      const response = await fetch(`/api/blog-pipeline/${record.id}/preview-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields })
      });

      const data = (await response.json()) as {
        record?: { id: string; fields: BlogPipelineFields };
        webhookError?: string;
        warning?: string;
      };

      if (!response.ok && response.status !== 207) {
        setRecord(previousRecord);
        fieldNames.forEach((name) => setFieldStatus(name, "error"));
        toast.error("✗ Failed to save — change reverted", { duration: 4000 });
        window.setTimeout(() => fieldNames.forEach((name) => setFieldStatus(name, "idle")), 1500);
        return false;
      }

      if (data.record?.fields) {
        setRecord((current) => ({
          ...current,
          fields: data.record!.fields
        }));
      }

      fieldNames.forEach((name) => setFieldStatus(name, "success"));
      if (data.webhookError) {
        toast.error(`Saved, but sync failed: ${data.webhookError}`, { duration: 5000 });
      } else {
        toast.success("✓ Saved & synced", { duration: 1500 });
      }
      window.setTimeout(() => fieldNames.forEach((name) => setFieldStatus(name, "idle")), 1500);
      return true;
    } catch {
      setRecord(previousRecord);
      fieldNames.forEach((name) => setFieldStatus(name, "error"));
      toast.error("✗ No response from server", { duration: 4000 });
      window.setTimeout(() => fieldNames.forEach((name) => setFieldStatus(name, "idle")), 1500);
      return false;
    }
  }

  function startBodyEdit() {
    if (!canEdit) return;
    setBodyDraft(bodyValue);
    setEditingBody(true);
  }

  async function saveBody() {
    setEditingBody(false);
    const targetField =
      bodyField === "AI Draft" && bodyDraft.trim() ? "Human Edited Draft" : bodyField;
    const ok = await savePreviewFields({ [targetField]: bodyDraft });
    if (ok && targetField === "Human Edited Draft" && bodyField === "AI Draft") {
      toast.success(copy.bodySavedAsHuman);
    }
  }

  return (
    <article className="mx-auto w-full max-w-[800px] px-4 py-10 sm:px-6 lg:px-0">
      <header className="space-y-5">
        {showMeta ? (
          <div className="flex flex-wrap items-center gap-3">
            <MetaLine value={authorLine} />
            <MetaLine value={dateLine} />
          </div>
        ) : null}

        {canEdit ? (
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            <InlineTextEditor
              value={asText(record.fields["Blog Title"]) || "Untitled Blog"}
              status={getFieldStatus("Blog Title")}
              displayClassName={TITLE_DISPLAY_CLASS}
              inputClassName={TITLE_INPUT_CLASS}
              onSave={(value) => savePreviewFields({ "Blog Title": value })}
            />
          </h1>
        ) : (
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {record.fields["Blog Title"] || "Untitled Blog"}
          </h1>
        )}

        {canEdit || record.fields["Meta Description"] ? (
          <div className="max-w-3xl">
            {canEdit ? (
              <MultilineEditor
                value={asText(record.fields["Meta Description"])}
                status={getFieldStatus("Meta Description")}
                displayClassName={META_DISPLAY_CLASS}
                onSave={(value) => savePreviewFields({ "Meta Description": value })}
              />
            ) : (
              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                {asText(record.fields["Meta Description"])}
              </p>
            )}
          </div>
        ) : null}

        {previewImage ? (
          <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            <img
              src={previewImage.url}
              alt={previewImage.alt}
              className="aspect-[16/9] w-full object-cover"
            />
          </figure>
        ) : null}
      </header>

      <div className="mt-10 border-t border-slate-200 pt-8">
        {editingBody ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">{copy.editingBody}</p>
              <SaveIndicator status={getFieldStatus(bodyField)}>
                <span className="text-xs text-slate-500">
                  {getFieldStatus(bodyField) === "saving"
                    ? copy.saving
                    : getFieldStatus(bodyField) === "success"
                      ? copy.saved
                      : getFieldStatus(bodyField) === "error"
                        ? copy.saveFailed
                        : ""}
                </span>
              </SaveIndicator>
            </div>
            <textarea
              autoFocus
              value={bodyDraft}
              onChange={(e) => setBodyDraft(e.target.value)}
              className="min-h-[420px] w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBody(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
              >
                {COPY.blogPipeline.cancel}
              </button>
              <button
                type="button"
                onClick={() => void saveBody()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                {copy.saveBody}
              </button>
            </div>
          </div>
        ) : renderedHtml ? (
          <div
            role={canEdit ? "button" : undefined}
            tabIndex={canEdit ? 0 : undefined}
            onClick={startBodyEdit}
            onKeyDown={(e) => {
              if (canEdit && (e.key === "Enter" || e.key === " ")) startBodyEdit();
            }}
            className={
              canEdit
                ? "blog-body cursor-text space-y-6 rounded-xl border border-transparent p-2 text-[17px] leading-[1.6] text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/40"
                : "blog-body space-y-6 text-[17px] leading-[1.6] text-slate-800"
            }
            title={canEdit ? copy.clickBody : undefined}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        ) : canEdit ? (
          <button
            type="button"
            onClick={startBodyEdit}
            className="w-full rounded-xl border border-dashed border-slate-300 px-4 py-12 text-sm text-slate-500 hover:border-blue-300 hover:bg-blue-50/40"
          >
            {copy.addBody}
          </button>
        ) : (
          <p className="text-sm text-slate-500">{copy.noBody}</p>
        )}
      </div>
    </article>
  );
}
