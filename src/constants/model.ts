/** Hugging Face resolve URL — follow redirects via fetch HEAD/GET */
export const MODEL_URL =
  'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf';

export const MODEL_FILENAME = 'Llama-3.2-1B-Instruct-Q4_K_M.gguf';

export const MODEL_DISPLAY_NAME = 'Llama 3.2 1B Instruct (Q4_K_M)';

/** Approximate size when Content-Length is missing (bytes) ~770 MiB */
export const MODEL_EXPECTED_BYTES_FALLBACK = 808_452_096;

export const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful, concise assistant running fully on the user device. Answer clearly and accurately.';

export const DEFAULT_N_PREDICT = 256;

export const DEFAULT_TEMPERATURE = 0.7;

export const STOP_WORDS = [
  '</s>',
  '<|end|>',
  '<|eot_id|>',
  '<|end_of_text|>',
  '<|im_end|>',
  '<|EOT|>',
  '<|END_OF_TURN_TOKEN|>',
  '<|end_of_turn|>',
  '<|endoftext|>',
];
