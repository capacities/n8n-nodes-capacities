import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const scannerSpec = '@n8n/scan-community-package@beta';
const supportedMajors = [22, 24];

function nodeMajor(version = process.versions.node) {
  return Number(version.split('.')[0]);
}

function nvmNodeBins() {
  const versionsDir = join(process.env.NVM_DIR || join(homedir(), '.nvm'), 'versions', 'node');
  if (!existsSync(versionsDir)) return [];

  return readdirSync(versionsDir)
    .filter((name) => supportedMajors.some((major) => name.startsWith(`v${major}.`)))
    .sort()
    .reverse()
    .map((name) => join(versionsDir, name, 'bin', 'node'))
    .filter((bin) => existsSync(bin));
}

function preferredNodeBin() {
  const wanted = readFileSync(join(root, '.nvmrc'), 'utf8').trim();
  const bins = nvmNodeBins();
  const candidates = [
    ...bins.filter((bin) => bin.includes(`/v${wanted}.`)),
    ...bins,
    '/opt/homebrew/opt/node@22/bin/node',
    '/usr/local/opt/node@22/bin/node',
    '/opt/homebrew/opt/node@24/bin/node',
    '/usr/local/opt/node@24/bin/node',
  ];
  return candidates.find((bin) => existsSync(bin));
}

if (process.env.N8N_SCAN_REEXEC !== '1' && !supportedMajors.includes(nodeMajor())) {
  const nodeBin = preferredNodeBin();
  if (!nodeBin) {
    console.error(
      `The n8n community package scanner needs Node ${supportedMajors.join(' or ')}. Node ${process.versions.node} has no isolated-vm prebuild.`,
    );
    process.exit(1);
  }

  const result = spawnSync(nodeBin, [fileURLToPath(import.meta.url)], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      N8N_SCAN_REEXEC: '1',
      PATH: `${dirname(nodeBin)}${delimiter}${process.env.PATH ?? ''}`,
    },
  });
  process.exit(result.status ?? 1);
}

const cacheDir = join(root, 'node_modules', '.cache', 'n8n-community-scan');
mkdirSync(cacheDir, { recursive: true });

const npm = join(dirname(process.execPath), 'npm');
const npmBin = existsSync(npm) ? npm : 'npm';
const cacheManifest = join(cacheDir, 'package.json');
if (!existsSync(cacheManifest)) {
  writeFileSync(cacheManifest, JSON.stringify({ name: 'n8n-community-scan', private: true, version: '1.0.0' }));
}

const install = spawnSync(npmBin, ['install', scannerSpec], {
  cwd: cacheDir,
  stdio: 'inherit',
  env: process.env,
});
if (install.status !== 0) process.exit(install.status ?? 1);

const { analyzePackage, SOURCE_FILE_PATTERNS } = await import(
  join(cacheDir, 'node_modules', '@n8n', 'scan-community-package', 'scanner', 'scanner.mjs')
);

if (!existsSync(join(root, 'dist'))) {
  console.error('dist/ is missing. Run npm run build before the community package scan.');
  process.exit(1);
}

const checks = [
  ['Source', await analyzePackage(root, SOURCE_FILE_PATTERNS)],
  ['Built package', await analyzePackage(root, ['package.json', 'dist/**/*.js', 'dist/**/*.json'])],
];

let failed = false;
for (const [label, result] of checks) {
  if (result.passed) {
    console.log(`${label} passed`);
    continue;
  }
  failed = true;
  console.error(`${label} failed: ${result.message}`);
  if (result.details) console.error(result.details);
}

if (failed) process.exit(1);
console.log(`Community package scan passed on Node ${process.versions.node}`);
