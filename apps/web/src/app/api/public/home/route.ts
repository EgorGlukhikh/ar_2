import { NextResponse } from "next/server";

import { getPublicHomePayload } from "@backend/public-home/get-public-home-payload";

export async function GET() {
  const payload = await getPublicHomePayload();
  return NextResponse.json(payload);
}
