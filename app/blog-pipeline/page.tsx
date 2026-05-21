import { redirect } from "next/navigation";

/** Legacy route — full pipeline lives at /blog-pipeline/status */
export default function BlogPipelineRedirectPage() {
  redirect("/blog-pipeline/status");
}
