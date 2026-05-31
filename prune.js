// 🍩 donut prune
import chalk from 'chalk';
import { DonutModel } from '../../models/manager.js';
import { formatBytes } from '../../utils/banner.js';

export async function pruneCommand(opts) {
  const manager = new DonutModel();
  const freed = await manager.prune(opts.dryRun);

  if (freed.length === 0) {
    console.log(chalk.green('\n  ✓ Nothing to clean up — already lean!\n'));
    return;
  }

  const totalFreed = freed.reduce((acc, f) => acc + f.size, 0);

  console.log(chalk.bold(`\n  ${opts.dryRun ? '[DRY RUN] ' : ''}Files to clean:\n`));
  for (const f of freed) {
    const prefix = opts.dryRun ? chalk.gray('  would remove') : chalk.red('  removed');
    console.log(`  ${prefix}: ${f.file} (${formatBytes(f.size)})`);
  }

  const verb = opts.dryRun ? 'Would free' : 'Freed';
  console.log(`\n  ${chalk.yellow(`${verb}: ${formatBytes(totalFreed)}`)}\n`);

  if (opts.dryRun) {
    console.log(chalk.gray('  Run without --dry-run to actually delete.\n'));
  }
}
