import { NextResponse, type NextRequest } from "next/server";

import { buildSafeNextPath } from "@/lib/validation/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const next = buildSafeNextPath(searchParams.get("next"), "/dashboard");

  return NextResponse.redirect(new URL(next, request.url));
}
