import type { VideoProvider } from "@academy/video-domain";

import { CloudflareStreamVideoProvider } from "@/lib/video/cloudflare-stream-provider";
import { MockVideoProvider } from "@/lib/video/mock-video-provider";

export function getVideoProvider(): VideoProvider {
  const providerName = process.env.VIDEO_PROVIDER?.toLowerCase() ?? "mock";

  if (providerName === "cloudflare_stream") {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error(
        "Cloudflare Stream provider selected, but CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_STREAM_API_TOKEN is missing.",
      );
    }

    return new CloudflareStreamVideoProvider(
      accountId,
      apiToken,
      process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE,
    );
  }

  return new MockVideoProvider();
}
