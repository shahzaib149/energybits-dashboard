import { NextResponse } from "next/server";
import { fetchBlogRecommendations } from "@/lib/blog-pipeline/recommendations";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";

export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!permissions.canSubmitBlogTopic(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await fetchBlogRecommendations();
  return NextResponse.json(data);
}
