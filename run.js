// 🍩 donut run <model> — interactive REPL
import chalk from 'chalk';
import readline from 'readline';
import { getModel, resolveVariant } from '../../models/registry.js';
import { DonutModel } from '../../models/manager.js';
import { pullCommand } from './pull.js';
import { DonutConfig } from '../../utils/config.js';
import { quantBadge } from '../../utils/banner.js';
import { LlamaCpp } from '../../server/llama.js';

export async function runCommand(modelName, opts) {
  const model = getModel(modelName);
  if (!model) {
    console.error(chalk.red(`\n  ✗ Unknown model: "${modelName}"`));
    process.exit(1);
  }

  const variant = resolveVariant(model, opts.quant);
  const manager = new DonutModel();

  // Auto-download if not present
  if (!manager.isDownloaded(model.id, variant.quant)) {
    console.log(chalk.yellow(`\n  Model not found locally. Downloading...\n`));
    await pullCommand(modelName, opts);
  }

  const config = await DonutConfig.load();
  const modelPath = manager.modelPath(model.id, variant.quant);

  console.log(`\n  ${chalk.yellow('🍩')} Running ${chalk.bold(model.id)} ${quantBadge(variant.quant)}`);
  console.log(`  ${chalk.gray('Type')} ${chalk.white('/exit')} ${chalk.gray('to quit,')} ${chalk.white('/clear')} ${chalk.gray('to reset context')}\n`);

  // Initialize llama.cpp runner
  const llama = new LlamaCpp();
  await llama.load(modelPath, {
    threads:    parseInt(opts.threads) || config.threads || undefined,
    ctx:        parseInt(opts.ctx)     || config.ctx_size,
    mmap:       opts.mmap !== false,
    gpuLayers:  config.gpu_layers,
    cacheType:  config.cache_type,     // q4_0 KV cache = less RAM during inference
    flashAttn:  config.flash_attention,
    template:   model.template,
  });

  const history = [];
  const rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question(chalk.cyan('  you › '), async (input) => {
      input = input.trim();
      if (!input) return prompt();

      // Commands
      if (input === '/exit' || input === '/quit') {
        console.log(chalk.gray('\n  Goodbye! 🍩\n'));
        await llama.unload();
        rl.close();
        return;
      }
      if (input === '/clear') {
        history.length = 0;
        console.log(chalk.gray('  Context cleared.\n'));
        return prompt();
      }
      if (input === '/history') {
        console.log(chalk.gray(`  Messages in context: ${history.length}`));
        return prompt();
      }

      history.push({ role: 'user', content: input });

      process.stdout.write(chalk.yellow('  🍩 › '));
      let response = '';

      try {
        await llama.chat(history, (token) => {
          process.stdout.write(token);
          response += token;
        });
        console.log('\n');
      } catch (err) {
        console.log('\n' + chalk.red(`  Error: ${err.message}\n`));
      }

      history.push({ role: 'assistant', content: response });
      prompt();
    });
  };

  prompt();
}
