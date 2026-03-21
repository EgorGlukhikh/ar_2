export type VideoSourceType =
  | "managed_upload"
  | "rutube_embed"
  | "cloud_import"
  | "external_embed";

export type VideoProviderName = "mock" | "cloudflare_stream";

export type VideoAssetStatus =
  | "draft"
  | "pending_upload"
  | "importing"
  | "processing"
  | "ready"
  | "error";

export interface CreateUploadSessionInput {
  lessonId: string;
  filename: string;
  mimeType: string;
  sizeInBytes: number;
  ownerId: string;
}

export interface CreateUploadSessionResult {
  uploadUrl: string;
  externalAssetId: string;
  expiresAt: Date;
}

export interface ImportVideoFromUrlInput {
  lessonId: string;
  sourceUrl: string;
  ownerId: string;
}

export interface ImportVideoFromUrlResult {
  externalAssetId: string;
  sourceUrl: string;
  status: VideoAssetStatus;
  playbackId?: string;
  playerUrl?: string;
}

export interface FinalizeUploadInput {
  externalAssetId: string;
  lessonId: string;
  ownerId: string;
}

export interface VideoAssetSnapshot {
  externalAssetId: string;
  status: VideoAssetStatus;
  playbackId?: string;
  playerUrl?: string;
  errorMessage?: string;
}

export interface VideoProvider {
  name: VideoProviderName;
  createUploadSession(
    input: CreateUploadSessionInput,
  ): Promise<CreateUploadSessionResult>;
  importFromUrl(
    input: ImportVideoFromUrlInput,
  ): Promise<ImportVideoFromUrlResult>;
  finalizeUpload(input: FinalizeUploadInput): Promise<VideoAssetSnapshot>;
  getAsset(externalAssetId: string): Promise<VideoAssetSnapshot>;
}
