/** Upload transport is owned by the consuming product; progress is never simulated. */
export type UploadContext = {
  signal: AbortSignal;
  onProgress: (percent: number) => void;
};
export type UploadHandler = (file: File, context: UploadContext) => Promise<void>;
