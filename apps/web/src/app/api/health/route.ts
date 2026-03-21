import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "academy-platform-web",
    timestamp: new Date().toISOString(),
  });
}
