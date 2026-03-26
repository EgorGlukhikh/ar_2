import { auth } from "@academy/auth";
import { NextResponse } from "next/server";

import { getPublicCatalogPayload } from "@backend/public-catalog/get-public-catalog-payload";

export async function GET() {
  const session = await auth();
  const payload = await getPublicCatalogPayload(session?.user?.id);
  return NextResponse.json(payload);
}
