// 🍩 donut list
import chalk from 'chalk';
import Table from 'cli-table3';
import { DonutModel } from '../../models/manager.js';
import { MODEL_REGISTRY } from '../../models/registry.js';
import { formatBytes, quantBadge, qualityLabel } from '../../utils/banner.js';

export async function listCommand(opts) {
  const manager = new DonutModel();
  const installed = await manager.listInstalled();

  if (installed.length === 0) {
    console.log(chalk.gray('\n  No models downloaded yet.\n'));
    console.log(`  Pull your first model: ${chalk.yellow('donut pull tinyllama')}`);
    console.log(chalk.gray('  (only 638MB with Q4 quantization!)\n'));

    showAvailable();
    return;
  }

  console.log(chalk.bold('\n  Installed Models\n'));

  const table = new Table({
    head: [
      chalk.white('Model'),
      chalk.white('Quant'),
      chalk.white('Size on Disk'),
      chalk.white('Installed'),
    ],
    style: { head: [], border: ['gray'] },
    chars: {
      top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
      bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
      left: '│', 'left-mid': '├', mid: '─', 'mid-mid': '┼',
      right: '│', 'right-mid': '┤', middle: '│',
    },
  });

  let totalSize = 0;

  // Sort
  const sorted = [...installed].sort((a, b) => {
    if (opts.sort === 'size') return b.size - a.size;
    if (opts.sort === 'date') return new Date(b.installedAt) - new Date(a.installedAt);
    return a.id.localeCompare(b.id);
  });

  for (const m of sorted) {
    totalSize += m.size;
    const date = new Date(m.installedAt).toLocaleDateString();
    table.push([
      chalk.bold(m.id),
      quantBadge(m.quant),
      chalk.yellow(formatBytes(m.size)),
      chalk.gray(date),
    ]);
  }

  console.log(table.toString());
  console.log(`\n  Total: ${chalk.yellow(formatBytes(totalSize))} across ${installed.length} model(s)\n`);

  // Savings tip
  const q8equiv = totalSize * 2;
  const saved = q8equiv - totalSize;
  if (saved > 0) {
    console.log(chalk.gray(`  💾 Estimated savings vs Q8: ~${formatBytes(saved)} saved by quantization\n`));
  }
}

function showAvailable() {
  console.log(chalk.bold('\n  Available Models\n'));

  const table = new Table({
    head: [chalk.white('Model'), chalk.white('Params'), chalk.white('Q4 Size'), chalk.white('Description')],
    style: { head: [], border: ['gray'] },
    colWidths: [18, 10, 12, 45],
  });

  for (const [id, m] of Object.entries(MODEL_REGISTRY)) {
    const q4 = m.variants.q4;
    table.push([
      chalk.bold(id),
      chalk.gray(m.params),
      chalk.yellow(q4?.size || '—'),
      chalk.gray(m.description),
    ]);
  }

  console.log(table.toString());
  console.log(chalk.gray('\n  Tip: Use Q4 for best disk-to-quality ratio.\n'));
}
