import type {
  CreateUploadSessionInput,
  CreateUploadSessionResult,
  FinalizeUploadInput,
  ImportVideoFromUrlInput,
  ImportVideoFromUrlResult,
  VideoAssetSnapshot,
  VideoProvider,
} from "@academy/video-domain";

type CloudflareEnvelope<T> = {
  success: boolean;
  errors?: Array<{
    code?: number;
    message?: string;
  }>;
  result: T;
};

type CloudflareDirectUploadResult = {
  uid: string;
  uploadURL: string;
};

type CloudflareVideoResult = {
  uid: string;
  readyToStream?: boolean;
  preview?: string;
  status?: {
    state?: string;
    errorReasonText?: string;
  };
};

function mapCloudflareStatus(video: CloudflareVideoResult) {
  if (video.readyToStream) {
    return "ready" as const;
  }

  const state = video.status?.state?.toLowerCase() ?? "";

  if (state.includes("error")) {
    return "error" as const;
  }

  return "processing" as const;
}

export class CloudflareStreamVideoProvider implements VideoProvider {
  name = "cloudflare_stream" as const;

  constructor(
    private readonly accountId: string,
    private readonly apiToken: string,
    private readonly customerCode?: string,
  ) {}

  private get apiBaseUrl() {
    return `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`;
  }

  private getPlayerUrl(uid: string) {
    if (this.customerCode) {
      return `https://customer-${this.customerCode}.cloudflarestream.com/${uid}/iframe`;
    }

    return `https://iframe.videodelivery.net/${uid}`;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as CloudflareEnvelope<T>;

    if (!response.ok || !payload.success) {
      const message =
        payload.errors?.map((error) => error.message).filter(Boolean).join("; ") ||
        "Cloudflare Stream request failed.";

      throw new Error(message);
    }

    return payload.result;
  }

  async createUploadSession(
    input: CreateUploadSessionInput,
  ): Promise<CreateUploadSessionResult> {
    const result = await this.request<CloudflareDirectUploadResult>(
      "/direct_upload",
      {
        method: "POST",
        body: JSON.stringify({
          maxDurationSeconds: 60 * 60 * 3,
          meta: {
            name: input.filename,
            lessonId: input.lessonId,
            ownerId: input.ownerId,
          },
        }),
      },
    );

    return {
      uploadUrl: result.uploadURL,
      externalAssetId: result.uid,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  async importFromUrl(
    input: ImportVideoFromUrlInput,
  ): Promise<ImportVideoFromUrlResult> {
    const result = await this.request<CloudflareVideoResult>("/copy", {
      method: "POST",
      body: JSON.stringify({
        url: input.sourceUrl,
        meta: {
          name: `lesson-${input.lessonId}`,
          lessonId: input.lessonId,
          ownerId: input.ownerId,
        },
      }),
    });

    return {
      externalAssetId: result.uid,
      sourceUrl: input.sourceUrl,
      status: mapCloudflareStatus(result),
      playbackId: result.uid,
      playerUrl: this.getPlayerUrl(result.uid),
    };
  }

  async finalizeUpload(
    input: FinalizeUploadInput,
  ): Promise<VideoAssetSnapshot> {
    return this.getAsset(input.externalAssetId);
  }

  async getAsset(externalAssetId: string): Promise<VideoAssetSnapshot> {
    const result = await this.request<CloudflareVideoResult>(
      `/${externalAssetId}`,
      {
        method: "GET",
      },
    );

    return {
      externalAssetId: result.uid,
      status: mapCloudflareStatus(result),
      playbackId: result.uid,
      playerUrl: this.getPlayerUrl(result.uid),
      errorMessage: result.status?.errorReasonText ?? undefined,
    };
  }
}
