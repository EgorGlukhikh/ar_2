import { auth } from "@academy/auth";
import { NextResponse } from "next/server";

import { getPublicCheckoutPayload } from "@backend/public-checkout/get-public-checkout-payload";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;
  const payload = await getPublicCheckoutPayload(orderId, session.user.id);
  return NextResponse.json(payload);
}
