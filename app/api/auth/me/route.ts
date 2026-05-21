import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";

export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  });
}
