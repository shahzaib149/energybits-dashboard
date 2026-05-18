import { AirtableRecord, BlogPipelineFields } from "@/lib/types";
import { getBlogPreviewImage } from "@/lib/blogImages";
import { formatBlogPreviewDate, getBlogPreviewSource, renderBlogContent } from "@/lib/blogPreview";
import { asText } from "@/lib/utils";

type BlogRecord = AirtableRecord<BlogPipelineFields>;

function MetaLine({ value }: { value?: string }) {
  if (!value) {
    return null;
  }

  return <span className="text-sm text-slate-500">{value}</span>;
}

export function BlogPreviewView({ record }: { record: BlogRecord }) {
  const source = getBlogPreviewSource(record);
  const previewImage = getBlogPreviewImage(record);
  const authorLine = record.fields["Author Name"] ? `By ${asText(record.fields["Author Name"])}` : undefined;
  const rawDate = record.fields["Published Date"] || record.fields["Scheduled Publish Date"];
  const dateLine = rawDate ? formatBlogPreviewDate(rawDate) : undefined;
  const showMeta = Boolean(authorLine || dateLine);

  return (
    <article className="mx-auto w-full max-w-[800px] px-4 py-10 sm:px-6 lg:px-0">
      <header className="space-y-5">
        {showMeta ? (
          <div className="flex flex-wrap items-center gap-3">
            <MetaLine value={authorLine} />
            <MetaLine value={dateLine} />
          </div>
        ) : null}
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          {record.fields["Blog Title"] || "Untitled Blog"}
        </h1>
        {record.fields["Meta Description"] ? (
          <p className="max-w-3xl text-lg leading-8 text-slate-600">{asText(record.fields["Meta Description"])}</p>
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
        {source ? (
          <div
            className="blog-body space-y-6 text-[17px] leading-[1.6] text-slate-800"
            dangerouslySetInnerHTML={{ __html: renderBlogContent(source) }}
          />
        ) : (
          <p className="text-sm text-slate-500">No draft content available for this record.</p>
        )}
      </div>
    </article>
  );
}
