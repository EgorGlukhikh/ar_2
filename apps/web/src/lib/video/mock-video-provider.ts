import { randomUUID } from "node:crypto";

import type {
  CreateUploadSessionInput,
  CreateUploadSessionResult,
  FinalizeUploadInput,
  ImportVideoFromUrlInput,
  ImportVideoFromUrlResult,
  VideoAssetSnapshot,
  VideoProvider,
} from "@academy/video-domain";

export class MockVideoProvider implements VideoProvider {
  name = "mock" as const;

  async createUploadSession(
    input: CreateUploadSessionInput,
  ): Promise<CreateUploadSessionResult> {
    void input;
    const externalAssetId = `mock_${randomUUID()}`;

    return {
      uploadUrl: `mock://upload/${externalAssetId}`,
      externalAssetId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  async importFromUrl(
    input: ImportVideoFromUrlInput,
  ): Promise<ImportVideoFromUrlResult> {
    return {
      externalAssetId: `mock_${randomUUID()}`,
      sourceUrl: input.sourceUrl,
      status: "ready",
      playbackId: `mock_playback_${randomUUID()}`,
    };
  }

  async finalizeUpload(
    input: FinalizeUploadInput,
  ): Promise<VideoAssetSnapshot> {
    return {
      externalAssetId: input.externalAssetId,
      status: "ready",
      playbackId: `mock_playback_${randomUUID()}`,
    };
  }

  async getAsset(externalAssetId: string): Promise<VideoAssetSnapshot> {
    return {
      externalAssetId,
      status: "ready",
      playbackId: `mock_playback_${randomUUID()}`,
    };
  }
}
