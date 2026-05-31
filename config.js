// 🍩 Donut Corp — Config
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

const CONFIG_DIR  = join(homedir(), '.donut');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULTS = {
  default_quant: 'q4',       // Best size/quality ratio
  server_port: 11434,        // OpenAI-compatible port (same as Ollama)
  server_host: '127.0.0.1',
  threads: null,             // null = auto-detect
  ctx_size: 2048,            // Context window (smaller = less RAM)
  mmap: true,                // Memory-mapped I/O (faster loads, same disk usage)
  mlock: false,              // Lock model in RAM (performance vs memory tradeoff)
  gpu_layers: 0,             // Layers to offload to GPU (0 = CPU only)
  flash_attention: true,     // Reduce VRAM by ~30% when using GPU
  cache_type: 'q4_0',        // KV-cache quantization (saves RAM during inference)
};

export class DonutConfig {
  static async load() {
    if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
    try {
      const raw = await readFile(CONFIG_FILE, 'utf8');
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  static async save(config) {
    await writeFile(CONFIG_FILE, JSON.stringify({ ...DEFAULTS, ...config }, null, 2));
  }

  static async get(key) {
    const config = await this.load();
    return config[key] ?? DEFAULTS[key];
  }

  static async set(key, value) {
    const config = await this.load();
    config[key] = value;
    await this.save(config);
  }
}
