// 🍩 Donut Corp — OpenAI-compatible API server
import express from 'express';
import { DonutModel } from '../models/manager.js';
import { getModel, resolveVariant, MODEL_REGISTRY } from '../models/registry.js';
import { DonutConfig } from '../utils/config.js';
import { LlamaCpp } from './llama.js';

const loadedModels = new Map(); // model_id:quant → LlamaCpp instance

export function createServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // CORS for local use
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // ─── GET /v1/models ────────────────────────────────────────────────────────
  app.get('/v1/models', async (req, res) => {
    const manager = new DonutModel();
    const installed = await manager.listInstalled();

    const models = installed.map(m => ({
      id: `${m.id}:${m.quant}`,
      object: 'model',
      created: Math.floor(new Date(m.installedAt).getTime() / 1000),
      owned_by: 'donut-corp',
    }));

    res.json({ object: 'list', data: models });
  });

  // ─── POST /v1/chat/completions ─────────────────────────────────────────────
  app.post('/v1/chat/completions', async (req, res) => {
    const { model: modelStr, messages, stream = false, max_tokens = 512 } = req.body;

    if (!modelStr || !messages) {
      return res.status(400).json({ error: { message: 'model and messages are required' } });
    }

    // Parse "modelid:quant" or just "modelid"
    const [modelName, quant] = modelStr.split(':');
    const model = getModel(modelName);
    if (!model) {
      return res.status(404).json({ error: { message: `Model not found: ${modelName}` } });
    }

    const config = await DonutConfig.load();
    const variant = resolveVariant(model, quant || config.default_quant);
    const cacheKey = `${model.id}:${variant.quant}`;

    // Lazy-load model (keep warm in memory)
    if (!loadedModels.has(cacheKey)) {
      const manager = new DonutModel();
      if (!manager.isDownloaded(model.id, variant.quant)) {
        return res.status(404).json({
          error: { message: `Model ${cacheKey} not downloaded. Run: donut pull ${model.id}` }
        });
      }

      const llama = new LlamaCpp();
      await llama.load(manager.modelPath(model.id, variant.quant), {
        threads: config.threads,
        ctx:     config.ctx_size,
        mmap:    config.mmap,
        gpuLayers: config.gpu_layers,
        cacheType: config.cache_type,
        flashAttn: config.flash_attention,
        template:  model.template,
      });
      loadedModels.set(cacheKey, llama);
    }

    const llama = loadedModels.get(cacheKey);
    const created = Math.floor(Date.now() / 1000);

    if (stream) {
      // SSE streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let tokenCount = 0;
      await llama.chat(messages, (token) => {
        if (tokenCount >= max_tokens) return;
        tokenCount++;
        const chunk = {
          id: `chatcmpl-donut-${Date.now()}`,
          object: 'chat.completion.chunk',
          created,
          model: cacheKey,
          choices: [{ index: 0, delta: { content: token }, finish_reason: null }],
        };
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      });

      res.write(`data: [DONE]\n\n`);
      res.end();
    } else {
      // Standard response
      const content = await llama.complete(messages);

      res.json({
        id: `chatcmpl-donut-${Date.now()}`,
        object: 'chat.completion',
        created,
        model: cacheKey,
        choices: [{
          index: 0,
          message: { role: 'assistant', content },
          finish_reason: 'stop',
        }],
        usage: {
          prompt_tokens: -1,   // Would need tokenizer to count accurately
          completion_tokens: -1,
          total_tokens: -1,
        },
      });
    }
  });

  // ─── Health check ──────────────────────────────────────────────────────────
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      name: 'donut-corp',
      loaded_models: [...loadedModels.keys()],
    });
  });

  return app;
}

export { DonutServer: createServer };
