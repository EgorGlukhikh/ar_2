import { redirect } from "next/navigation";

import { recordEmailClick } from "@/features/email/service";

type RouteProps = {
  params: Promise<{
    trackingToken: string;
  }>;
};

function getFallbackUrl() {
  return (
    process.env.APP_BASE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export async function GET(request: Request, { params }: RouteProps) {
  const { trackingToken } = await params;
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target) {
    redirect(getFallbackUrl());
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(target);
  } catch {
    redirect(getFallbackUrl());
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    redirect(getFallbackUrl());
  }

  await recordEmailClick(trackingToken, parsedUrl.toString());
  redirect(parsedUrl.toString());
}
