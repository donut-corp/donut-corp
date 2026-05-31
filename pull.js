// 🍩 donut pull <model>
import chalk from 'chalk';
import ora from 'ora';
import { getModel, resolveVariant } from '../../models/registry.js';
import { DonutModel } from '../../models/manager.js';
import { formatBytes, quantBadge, qualityLabel } from '../../utils/banner.js';

export async function pullCommand(modelName, opts) {
  const model = getModel(modelName);
  if (!model) {
    console.error(chalk.red(`\n  ✗ Unknown model: "${modelName}"`));
    console.log(chalk.gray('  Run: donut list --available'));
    process.exit(1);
  }

  const variant = resolveVariant(model, opts.quant);
  const manager = new DonutModel();

  // Already downloaded?
  if (!opts.force && manager.isDownloaded(model.id, variant.quant)) {
    console.log(chalk.green(`\n  ✓ ${model.id} ${quantBadge(variant.quant)} already downloaded (${variant.size})`));
    console.log(chalk.gray('  Use --force to re-download'));
    return;
  }

  console.log(`\n  Pulling ${chalk.bold(model.id)} ${quantBadge(variant.quant)}`);
  console.log(`  ${chalk.gray('Size:')} ${variant.size}  ${chalk.gray('Quality:')} ${qualityLabel(variant.quality)}`);
  console.log(`  ${chalk.gray('Parameters:')} ${model.params}  ${chalk.gray('Template:')} ${model.template}\n`);

  // Disk space tip
  if (opts.quant !== 'q4') {
    const tip = opts.quant < 'q4'
      ? chalk.yellow(`  💡 Tip: Q4 gives better quality for only a bit more space`)
      : chalk.yellow(`  💡 Tip: Q4 saves space with minimal quality loss`);
    console.log(tip + '\n');
  }

  const spinner = ora({
    text: 'Connecting...',
    color: 'yellow',
    prefixText: ' ',
  }).start();

  let lastPercent = -1;

  try {
    await manager.download(model, variant, (progress) => {
      if (progress.status === 'cached') {
        spinner.succeed(chalk.green('Already cached locally'));
        return;
      }
      if (progress.status === 'downloading') {
        const pct = progress.percent;
        if (pct !== lastPercent) {
          lastPercent = pct;
          const downloaded = formatBytes(progress.downloaded);
          const total = formatBytes(progress.total);
          spinner.text = `Downloading... ${chalk.yellow(pct + '%')} (${downloaded} / ${total})`;
        }
      }
      if (progress.status === 'complete') {
        spinner.succeed(chalk.green(`Downloaded → ${progress.path}`));
      }
    });

    const size = manager.diskUsage(model.id, variant.quant);
    console.log(`\n  ${chalk.green('✓')} Ready to use: ${chalk.bold(`donut run ${model.id}`)}`);
    console.log(`  ${chalk.gray('Disk used:')} ${formatBytes(size)}\n`);
  } catch (err) {
    spinner.fail(chalk.red('Download failed'));
    console.error(chalk.gray(`  ${err.message}`));
    process.exit(1);
  }
}
