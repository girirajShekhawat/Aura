import { initLlama, type LlamaContext } from 'llama.rn';

import {
  DEFAULT_N_PREDICT,
  DEFAULT_TEMPERATURE,
  STOP_WORDS,
} from '../constants/model';
import { modelDestinationFile } from './ModelManager';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

let context: LlamaContext | null = null;

/** Model URI for diagnostics / UI */
export function getLoadedModelUri(): string {
  return modelDestinationFile.uri;
}

export async function initLlamaService(
  onInitProgress?: (progress: number) => void,
): Promise<LlamaContext> {
  if (context) return context;

  const modelUri = modelDestinationFile.uri;

  context = await initLlama(
    {
      model: modelUri,
      use_mlock: false,
      n_ctx: 2048,
      n_gpu_layers: 99,
    },
    onInitProgress,
  );

  return context;
}

export function isLlamaReady(): boolean {
  return context !== null;
}

export async function chat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  options?: { n_predict?: number; temperature?: number },
): Promise<{ text: string }> {
  if (!context) throw new Error('Llama context not initialized');

  const result = await context.completion(
    {
      messages,
      n_predict: options?.n_predict ?? DEFAULT_N_PREDICT,
      temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
      stop: STOP_WORDS,
    },
    (data) => {
      const piece = typeof data.token === 'string' ? data.token : '';
      if (piece) onToken(piece);
    },
  );

  return { text: result.text ?? '' };
}

export async function releaseLlama(): Promise<void> {
  try {
    if (context) {
      await context.release();
    }
  } finally {
    context = null;
  }
}
