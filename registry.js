// 🍩 Donut Corp — Model Registry
// Strategy: Always prefer smallest viable quantization (Q4_K_M sweet spot)
// Shared layer cache prevents duplicate downloads across model families

export const MODEL_REGISTRY = {
  // ─── Tiny models (< 1GB at Q4) ───────────────────────────────────────────
  'tinyllama': {
    id: 'tinyllama',
    family: 'llama',
    params: '1.1B',
    base: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
    variants: {
      q2: { size: '320MB', url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q2_K.gguf', quality: 'low' },
      q4: { size: '638MB', url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf', quality: 'good' },
      q8: { size: '1.1GB', url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q8_0.gguf', quality: 'high' },
    },
    default_quant: 'q4',
    template: 'chatml',
    description: 'Ultra-small model, great for testing and low-power devices',
  },

  // ─── Small models (1-3GB at Q4) ──────────────────────────────────────────
  'phi3-mini': {
    id: 'phi3-mini',
    family: 'phi3',
    params: '3.8B',
    base: 'microsoft/Phi-3-mini-4k-instruct',
    variants: {
      q4: { size: '2.2GB', url: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf', quality: 'good' },
    },
    default_quant: 'q4',
    template: 'phi3',
    description: 'Microsoft Phi-3 Mini — punches above its weight class',
  },

  'qwen2.5-1.5b': {
    id: 'qwen2.5-1.5b',
    family: 'qwen2',
    params: '1.5B',
    base: 'Qwen/Qwen2.5-1.5B-Instruct',
    variants: {
      q4: { size: '986MB', url: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf', quality: 'good' },
      q8: { size: '1.6GB', url: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q8_0.gguf', quality: 'high' },
    },
    default_quant: 'q4',
    template: 'qwen',
    description: 'Compact multilingual model with strong reasoning',
  },

  // ─── Medium models (3-8GB at Q4) ─────────────────────────────────────────
  'llama3.2-3b': {
    id: 'llama3.2-3b',
    family: 'llama3',
    params: '3B',
    base: 'meta-llama/Llama-3.2-3B-Instruct',
    variants: {
      q3: { size: '1.5GB', url: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q3_K_M.gguf', quality: 'ok' },
      q4: { size: '2.0GB', url: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf', quality: 'good' },
      q6: { size: '2.5GB', url: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q6_K.gguf', quality: 'great' },
    },
    default_quant: 'q4',
    template: 'llama3',
    description: 'Meta Llama 3.2 3B — best small model for general tasks',
  },

  'mistral-7b': {
    id: 'mistral-7b',
    family: 'mistral',
    params: '7B',
    base: 'mistralai/Mistral-7B-Instruct-v0.3',
    variants: {
      q3: { size: '3.1GB', url: 'https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.3-GGUF/resolve/main/mistral-7b-instruct-v0.3.Q3_K_M.gguf', quality: 'ok' },
      q4: { size: '4.1GB', url: 'https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.3-GGUF/resolve/main/mistral-7b-instruct-v0.3.Q4_K_M.gguf', quality: 'good' },
      q5: { size: '4.8GB', url: 'https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.3-GGUF/resolve/main/mistral-7b-instruct-v0.3.Q5_K_M.gguf', quality: 'great' },
    },
    default_quant: 'q4',
    template: 'mistral',
    description: 'Mistral 7B — industry-standard quality/size ratio',
  },

  'gemma2-2b': {
    id: 'gemma2-2b',
    family: 'gemma2',
    params: '2B',
    base: 'google/gemma-2-2b-it',
    variants: {
      q4: { size: '1.6GB', url: 'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf', quality: 'good' },
      q8: { size: '2.7GB', url: 'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q8_0.gguf', quality: 'high' },
    },
    default_quant: 'q4',
    template: 'gemma',
    description: 'Google Gemma 2 2B — strong multilingual capabilities',
  },
};

// Disk usage recommendations per available space
export const SPACE_RECOMMENDATIONS = {
  '<2GB':  ['tinyllama', 'qwen2.5-1.5b'],
  '2-4GB': ['llama3.2-3b', 'phi3-mini', 'gemma2-2b'],
  '4-8GB': ['mistral-7b', 'llama3.2-3b'],
  '>8GB':  ['mistral-7b'],
};

export function getModel(name) {
  // Allow shorthand: "llama3" → "llama3.2-3b", "mistral" → "mistral-7b"
  const aliases = {
    'llama3': 'llama3.2-3b',
    'llama': 'llama3.2-3b',
    'mistral': 'mistral-7b',
    'phi3': 'phi3-mini',
    'phi': 'phi3-mini',
    'gemma': 'gemma2-2b',
    'gemma2': 'gemma2-2b',
    'qwen': 'qwen2.5-1.5b',
    'tiny': 'tinyllama',
  };

  const resolved = aliases[name.toLowerCase()] || name.toLowerCase();
  return MODEL_REGISTRY[resolved] || null;
}

export function resolveVariant(model, quantLevel) {
  const q = quantLevel?.toLowerCase() || model.default_quant;
  const variant = model.variants[q];
  if (!variant) {
    const available = Object.keys(model.variants).join(', ');
    throw new Error(`Quantization '${q}' not available for ${model.id}. Available: ${available}`);
  }
  return { ...variant, quant: q };
}
