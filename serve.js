// 🍩 donut serve
import chalk from 'chalk';
import ora from 'ora';
import { createServer } from '../../server/index.js';

export async function serveCommand(opts) {
  const port = parseInt(opts.port);
  const host = opts.host;

  console.log(`\n  ${chalk.yellow('🍩')} Starting Donut API server...\n`);

  const spinner = ora({ text: 'Initializing...', prefixText: '  ' }).start();

  try {
    const server = createServer();
    await new Promise((resolve, reject) => {
      server.listen(port, host, () => {
        spinner.succeed(chalk.green(`Server running at http://${host}:${port}`));
        resolve();
      });
      server.on('error', reject);
    });

    console.log(`\n  ${chalk.gray('OpenAI-compatible endpoints:')}`);
    console.log(`  ${chalk.white('POST')} ${chalk.gray('http://' + host + ':' + port)}/v1/chat/completions`);
    console.log(`  ${chalk.white('GET ')} ${chalk.gray('http://' + host + ':' + port)}/v1/models`);
    console.log(`\n  ${chalk.gray('Press Ctrl+C to stop')}\n`);

    process.on('SIGINT', () => {
      console.log(chalk.gray('\n\n  Server stopped. Goodbye! 🍩\n'));
      process.exit(0);
    });
  } catch (err) {
    spinner.fail(chalk.red('Failed to start server'));
    console.error(chalk.gray(`  ${err.message}`));
    process.exit(1);
  }
}
