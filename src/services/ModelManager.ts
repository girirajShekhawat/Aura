import { Directory, File as FSFile, Paths } from 'expo-file-system';

import {
  MODEL_EXPECTED_BYTES_FALLBACK,
  MODEL_FILENAME,
  MODEL_URL,
} from '../constants/model';

const modelsDirectory = new Directory(Paths.document, 'models');

export const modelDestinationFile = new FSFile(modelsDirectory, MODEL_FILENAME);

/**
 * Try to get Content-Length from the CDN (helps progress UI).
 */
export async function fetchContentLength(
  url: string,
): Promise<number | undefined> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const raw = res.headers.get('content-length');
    if (!raw) return undefined;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  } catch {
    return undefined;
  }
}

function ensureModelsDir(): void {
  if (!modelsDirectory.exists) {
    modelsDirectory.create({ intermediates: true });
  }
}

export function isModelOnDisk(): boolean {
  return modelDestinationFile.exists;
}

export async function deleteModel(): Promise<void> {
  try {
    if (modelDestinationFile.exists) {
      modelDestinationFile.delete();
    }
  } catch {
    // ignore — file may already be gone
  }
}

export type DownloadProgress = (received: number, total: number) => void;

/**
 * Downloads GGUF if missing. DownloadOptions in SDK 54 has no onProgress —
 * Android: poll destination size while downloading. iOS: writes to temp then moves,
 * so we only get byte updates meaningfully after completion; UI shows indeterminate on iOS.
 */
export async function downloadModelIfNeeded(
  onProgress: DownloadProgress,
): Promise<FSFile> {
  if (modelDestinationFile.exists) {
    const size =
      typeof modelDestinationFile.size === 'number'
        ? modelDestinationFile.size
        : 0;
    onProgress(size, Math.max(size, 1));
    return modelDestinationFile;
  }

  ensureModelsDir();

  const explicitTotal =
    (await fetchContentLength(MODEL_URL)) ?? MODEL_EXPECTED_BYTES_FALLBACK;

  let done = false;
  let progressTimer: ReturnType<typeof setInterval> | undefined;

  // Android streams into the destination file → polling works.
  progressTimer = setInterval(() => {
    if (!modelDestinationFile.exists) {
      onProgress(0, explicitTotal);
      return;
    }
    const soFar = modelDestinationFile.size ?? 0;
    onProgress(soFar, explicitTotal);
    if (done) {
      if (progressTimer) clearInterval(progressTimer);
    }
  }, 400);

  try {
    onProgress(0, explicitTotal);
    const downloaded = await FSFile.downloadFileAsync(
      MODEL_URL,
      modelDestinationFile,
      { idempotent: true },
    );
    done = true;
    // downloadFileAsync is typed as global `File` in some TS configs; normalize to Expo FSFile.
    const file = new FSFile(downloaded.uri);
    const finalSize = typeof file.size === 'number' ? file.size : 0;
    onProgress(finalSize, Math.max(finalSize, explicitTotal));
    return file;
  } finally {
    done = true;
    if (progressTimer) clearInterval(progressTimer);
  }
}
