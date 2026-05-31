// 🍩 donut remove
import chalk from 'chalk';
import inquirer from 'inquirer';
import { getModel, resolveVariant } from '../../models/registry.js';
import { DonutModel } from '../../models/manager.js';
import { formatBytes } from '../../utils/banner.js';

export async function removeCommand(modelName, opts) {
  const manager = new DonutModel();

  // Parse "model:quant" syntax
  const [name, quant = 'q4'] = modelName.split(':');
  const model = getModel(name);

  if (!model) {
    console.error(chalk.red(`  ✗ Unknown model: "${name}"`));
    process.exit(1);
  }

  const variant = resolveVariant(model, quant);

  if (!manager.isDownloaded(model.id, variant.quant)) {
    console.log(chalk.gray(`\n  Model ${model.id}:${variant.quant} is not installed.\n`));
    return;
  }

  const size = manager.diskUsage(model.id, variant.quant);

  if (!opts.force) {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Remove ${chalk.bold(model.id)}:${variant.quant} (${formatBytes(size)})?`,
      default: false,
    }]);
    if (!confirm) {
      console.log(chalk.gray('  Cancelled.'));
      return;
    }
  }

  await manager.remove(model.id, variant.quant);
  console.log(chalk.green(`\n  ✓ Removed ${model.id}:${variant.quant} (freed ${formatBytes(size)})\n`));
}
