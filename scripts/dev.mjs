import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function nodeMajor(version = process.versions.node) {
  return Number(version.split('.')[0]);
}

function nvmNode24() {
  const versionsDir = join(process.env.NVM_DIR || join(homedir(), '.nvm'), 'versions', 'node');
  if (!existsSync(versionsDir)) return undefined;

  const match = readdirSync(versionsDir)
    .filter((name) => name.startsWith('v24.'))
    .sort()
    .reverse()
    .map((name) => join(versionsDir, name, 'bin', 'node'))
    .find((bin) => existsSync(bin));
  return match;
}

function nodeReportsMajor(bin, major) {
  const result = spawnSync(bin, ['-p', 'process.versions.node'], { encoding: 'utf8' });
  return result.status === 0 && nodeMajor(result.stdout.trim()) === major;
}

function node24Bin() {
  if (nodeMajor() === 24) return process.execPath;

  const candidates = [nvmNode24(), '/opt/homebrew/opt/node@24/bin/node', '/usr/local/opt/node@24/bin/node'].filter(
    Boolean,
  );
  return candidates.find((bin) => existsSync(bin) && nodeReportsMajor(bin, 24));
}

if (process.env.N8N_DEV_REEXEC !== '1' && nodeMajor() !== 24) {
  const nodeBin = node24Bin();
  if (!nodeBin) {
    console.error(
      `n8n requires Node 24. Node ${process.versions.node} has no isolated-vm prebuild, so the dev server cannot install n8n.`,
    );
    console.error('Install Node 24 with: nvm install 24');
    process.exit(1);
  }

  const result = spawnSync(nodeBin, [fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      N8N_DEV_REEXEC: '1',
      PATH: `${dirname(nodeBin)}${delimiter}${process.env.PATH ?? ''}`,
    },
  });
  process.exit(result.status ?? 1);
}

const cli = join(root, 'node_modules', '@n8n', 'node-cli', 'bin', 'n8n-node.mjs');
const result = spawnSync(process.execPath, [cli, 'dev', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});
process.exit(result.status ?? 1);
