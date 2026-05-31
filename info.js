// 🍩 donut info <model>
import chalk from 'chalk';
import { getModel } from '../../models/registry.js';
import { DonutModel } from '../../models/manager.js';
import { formatBytes, quantBadge, qualityLabel } from '../../utils/banner.js';

export async function infoCommand(modelName) {
  const model = getModel(modelName);
  if (!model) {
    console.error(chalk.red(`\n  ✗ Unknown model: "${modelName}"\n`));
    process.exit(1);
  }

  const manager = new DonutModel();
  console.log(`\n  ${chalk.bold(model.id)} ${chalk.gray(`(${model.params})`)}`);
  console.log(`  ${chalk.gray(model.description)}\n`);
  console.log(`  ${chalk.gray('Family:')}   ${model.family}`);
  console.log(`  ${chalk.gray('Template:')} ${model.template}`);
  console.log(`  ${chalk.gray('Base:')}     ${model.base}\n`);

  console.log(chalk.bold('  Available Quantizations:\n'));

  for (const [q, v] of Object.entries(model.variants)) {
    const downloaded = manager.isDownloaded(model.id, q);
    const localSize = downloaded ? formatBytes(manager.diskUsage(model.id, q)) : null;
    const status = downloaded
      ? chalk.green('✓ downloaded') + chalk.gray(` (${localSize})`)
      : chalk.gray('not downloaded');

    console.log(
      `    ${quantBadge(q)}  ${chalk.yellow(v.size.padEnd(8))}  ` +
      `${qualityLabel(v.quality).padEnd(14)}  ${status}`
    );
  }

  console.log(`\n  ${chalk.gray('Pull with:')} donut pull ${model.id} --quant q4\n`);
}
