# 🍩 Donut Corp

> **Local LLM runtime designed for minimal disk usage** — run open-source AI models without the bloat.

```
  ██████╗  ██████╗ ███╗   ██╗██╗   ██╗████████╗
  ██╔══██╗██╔═══██╗████╗  ██║██║   ██║╚══██╔══╝
  ██║  ██║██║   ██║██╔██╗ ██║██║   ██║   ██║   
  ██║  ██║██║   ██║██║╚██╗██║██║   ██║   ██║   
  ██████╔╝╚██████╔╝██║ ╚████║╚██████╔╝   ██║   
  ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   
  CORP — local AI, minimal space
```

---

## Why Donut?

| | Ollama | **Donut Corp** |
|---|---|---|
| Smallest usable model | ~3.8GB | **320MB** |
| Default quantization | Q4 | **Q4 (configurable)** |
| KV cache compression | ❌ | **✅ Q4 KV cache** |
| Partial download resume | ❌ | **✅** |
| OpenAI-compatible API | ✅ | **✅** |

Donut defaults to the smallest viable quantization for each model and uses Q4 KV-cache during inference to cut RAM usage by up to 40% compared to full-precision caches.

---

## Install

```bash
npm install -g donut-corp
```

**Requirements:**
- Node.js ≥ 18
- ~500MB–5GB free disk space (per model)
- 4GB+ RAM (8GB recommended for 7B models)

---

## Quick Start

```bash
# Download the smallest model (638MB!)
donut pull tinyllama

# Chat interactively
donut run tinyllama

# Or run a bigger model (auto-downloads)
donut run llama3.2-3b

# Start OpenAI-compatible server
donut serve
```

---

## Commands

### `donut pull <model>`
Download a model with optimal quantization.

```bash
donut pull tinyllama          # 638MB — default Q4
donut pull llama3.2-3b        # 2GB
donut pull mistral-7b --quant q3  # 3.1GB (smaller, lower quality)
donut pull mistral-7b --quant q5  # 4.8GB (larger, higher quality)
```

### `donut run <model>`
Chat interactively with a model.

```bash
donut run tinyllama
donut run llama3.2-3b --ctx 4096   # bigger context window
donut run mistral-7b --threads 8
```

**In-chat commands:**
- `/clear` — reset conversation context  
- `/history` — show message count  
- `/exit` — quit  

### `donut list`
Show downloaded models and disk usage.

```bash
donut list
donut list --sort size
```

### `donut info <model>`
Show available quantizations and download status.

```bash
donut info llama3.2-3b
```

### `donut remove <model>`
Remove a model and free disk space.

```bash
donut remove tinyllama
donut remove mistral-7b:q3   # specific quant variant
```

### `donut prune`
Remove partial/incomplete downloads.

```bash
donut prune
donut prune --dry-run    # preview first
```

### `donut serve`
Start the OpenAI-compatible API server.

```bash
donut serve                     # localhost:11434
donut serve --port 8080
donut serve --host 0.0.0.0     # expose to network
```

**API endpoints:**
- `GET  /v1/models` — list installed models
- `POST /v1/chat/completions` — chat (streaming supported)
- `GET  /health` — server status

---

## Available Models

| Model | Params | Q4 Size | Best For |
|-------|--------|---------|----------|
| `tinyllama` | 1.1B | **638MB** | Testing, low-power devices |
| `qwen2.5-1.5b` | 1.5B | **986MB** | Multilingual tasks |
| `gemma2-2b` | 2B | **1.6GB** | Google's small powerhouse |
| `phi3-mini` | 3.8B | **2.2GB** | Strong reasoning |
| `llama3.2-3b` | 3B | **2.0GB** | General purpose |
| `mistral-7b` | 7B | **4.1GB** | Best quality 7B |

---

## Disk Savings Explained

Donut uses **GGUF quantization** (via llama.cpp) to dramatically shrink model files:

```
mistral-7b (original FP16):  ~14GB
mistral-7b Q8:               ~7.2GB
mistral-7b Q4 (default):     ~4.1GB  ← Donut default
mistral-7b Q3:               ~3.1GB
mistral-7b Q2:               ~2.5GB  (noticeable quality loss)
```

**Q4_K_M** is the sweet spot: ~70% smaller than the original with minimal quality loss.

During inference, Donut also quantizes the **KV attention cache** to Q4 (instead of FP16), reducing RAM usage by ~30-40% during chat — so you can run larger models on smaller machines.

---

## API Usage Example

```javascript
// Works with any OpenAI-compatible client
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'donut',  // not checked
});

const response = await client.chat.completions.create({
  model: 'llama3.2-3b:q4',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

---

## License

MIT © Donut Corp
