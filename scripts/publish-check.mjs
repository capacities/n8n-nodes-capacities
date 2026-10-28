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

  return readdirSync(versionsDir)
    .filter((name) => name.startsWith('v24.'))
    .sort()
    .reverse()
    .map((name) => join(versionsDir, name, 'bin', 'node'))
    .find((bin) => existsSync(bin));
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

if (process.env.N8N_PUBLISH_CHECK_REEXEC !== '1' && nodeMajor() !== 24) {
  const nodeBin = node24Bin();
  if (!nodeBin) {
    console.error(
      `Publish checks need Node 24. Node ${process.versions.node} has no isolated-vm prebuild, so npm run scan cannot install n8n.`,
    );
    console.error('Install Node 24 with: nvm install 24');
    process.exit(1);
  }

  const result = spawnSync(nodeBin, [fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      N8N_PUBLISH_CHECK_REEXEC: '1',
      PATH: `${dirname(nodeBin)}${delimiter}${process.env.PATH ?? ''}`,
    },
  });
  process.exit(result.status ?? 1);
}

function run(command, args) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const npm = join(dirname(process.execPath), 'npm');
const npmBin = existsSync(npm) ? npm : 'npm';

run(npmBin, ['run', 'lint']);
run(npmBin, ['run', 'build']);
run(npmBin, ['run', 'scan']);
run(process.execPath, [join(root, 'scripts', 'check-requests.mjs')]);

console.log(`\nPublish checks passed on Node ${process.versions.node}`);
