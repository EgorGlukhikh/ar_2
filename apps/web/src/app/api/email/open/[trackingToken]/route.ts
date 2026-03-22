import { recordEmailOpen } from "@/features/email/service";

type RouteProps = {
  params: Promise<{
    trackingToken: string;
  }>;
};

const pixelGif = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64",
);

export async function GET(_: Request, { params }: RouteProps) {
  const { trackingToken } = await params;

  await recordEmailOpen(trackingToken);

  return new Response(pixelGif, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, max-age=0",
      "Content-Length": String(pixelGif.length),
    },
  });
}
