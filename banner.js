// 🍩 Donut Corp — Banner
import chalk from 'chalk';

export function printBanner() {
  const donut = chalk.yellow(`
  ██████╗  ██████╗ ███╗   ██╗██╗   ██╗████████╗
  ██╔══██╗██╔═══██╗████╗  ██║██║   ██║╚══██╔══╝
  ██║  ██║██║   ██║██╔██╗ ██║██║   ██║   ██║   
  ██║  ██║██║   ██║██║╚██╗██║██║   ██║   ██║   
  ██████╔╝╚██████╔╝██║ ╚████║╚██████╔╝   ██║   
  ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   `);

  const corp = chalk.white.bold('CORP') + chalk.gray(' — local AI, minimal space');

  console.log(donut);
  console.log('  ' + corp + '\n');
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function quantBadge(quant) {
  const colors = {
    q2: chalk.red,
    q3: chalk.rgb(255, 150, 0),
    q4: chalk.green,
    q5: chalk.cyan,
    q6: chalk.blue,
    q8: chalk.magenta,
  };
  const fn = colors[quant] || chalk.white;
  return fn(`[${quant.toUpperCase()}]`);
}

export function qualityLabel(quality) {
  const map = {
    low:   chalk.red('◆ low'),
    ok:    chalk.rgb(255, 150, 0)('◆ ok'),
    good:  chalk.green('◆ good'),
    great: chalk.cyan('◆ great'),
    high:  chalk.magenta('◆ high'),
  };
  return map[quality] || quality;
}
