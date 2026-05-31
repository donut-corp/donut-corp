// 🍩 Donut Corp — llama.cpp runner
// Wraps node-llama-cpp with disk/memory-saving settings

import { getLlama, LlamaChatSession } from 'node-llama-cpp';

// Chat templates per model family
const TEMPLATES = {
  llama3: {
    system: (s) => `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${s}<|eot_id|>`,
    user:   (m) => `<|start_header_id|>user<|end_header_id|>\n\n${m}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
    stop:   ['<|eot_id|>'],
  },
  chatml: {
    system: (s) => `<|im_start|>system\n${s}<|im_end|>\n`,
    user:   (m) => `<|im_start|>user\n${m}<|im_end|>\n<|im_start|>assistant\n`,
    stop:   ['<|im_end|>'],
  },
  mistral: {
    system: (s) => ``,
    user:   (m) => `[INST] ${m} [/INST]`,
    stop:   ['</s>'],
  },
  phi3: {
    system: (s) => `<|system|>\n${s}<|end|>\n`,
    user:   (m) => `<|user|>\n${m}<|end|>\n<|assistant|>\n`,
    stop:   ['<|end|>'],
  },
  gemma: {
    system: (s) => ``,
    user:   (m) => `<start_of_turn>user\n${m}<end_of_turn>\n<start_of_turn>model\n`,
    stop:   ['<end_of_turn>'],
  },
  qwen: {
    system: (s) => `<|im_start|>system\n${s}<|im_end|>\n`,
    user:   (m) => `<|im_start|>user\n${m}<|im_end|>\n<|im_start|>assistant\n`,
    stop:   ['<|im_end|>'],
  },
};

export class LlamaCpp {
  constructor() {
    this.llama   = null;
    this.model   = null;
    this.ctx     = null;
    this.template = null;
  }

  async load(modelPath, opts = {}) {
    this.template = TEMPLATES[opts.template] || TEMPLATES.chatml;

    this.llama = await getLlama({
      gpu: opts.gpuLayers > 0 ? 'auto' : false,
    });

    // 🍩 Key optimizations for minimal resource usage:
    this.model = await this.llama.loadModel({
      modelPath,
      useMmap:       opts.mmap !== false,    // memory-mapped = faster load, same disk usage
      useMlock:      false,                   // don't pin to RAM unless explicitly requested
      gpuLayers:     opts.gpuLayers || 0,
    });

    this.ctx = await this.model.createContext({
      contextSize:     opts.ctx || 2048,      // smaller = less RAM
      threads:         opts.threads,
      flashAttention:  opts.flashAttn !== false, // reduces memory by 30-50%
      // KV cache quantization: stores attention cache in Q4 instead of FP16
      // This reduces RAM usage during inference significantly
      ...(opts.cacheType ? { typeK: opts.cacheType, typeV: opts.cacheType } : {}),
    });
  }

  // Streaming chat
  async chat(messages, onToken) {
    if (!this.ctx) throw new Error('Model not loaded. Call load() first.');

    const session = new LlamaChatSession({ contextSequence: this.ctx.getSequence() });

    const lastUser = messages.filter(m => m.role === 'user').pop();
    if (!lastUser) throw new Error('No user message found');

    // Build history (all messages except the last user)
    const history = messages.slice(0, -1);
    for (const msg of history) {
      if (msg.role === 'user') {
        await session.prompt(msg.content, { onTextChunk: () => {} });
      }
    }

    // Stream the response
    await session.prompt(lastUser.content, {
      onTextChunk: (text) => onToken(text),
    });
  }

  async unload() {
    this.ctx?.dispose?.();
    this.model?.dispose?.();
    this.llama?.dispose?.();
  }

  // For use in the API server without streaming
  async complete(messages) {
    let result = '';
    await this.chat(messages, (token) => { result += token; });
    return result;
  }
}
