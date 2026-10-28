import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const portal = process.env.CAPACITIES_PORTAL || join(root, '..', 'capacities-portal');
const portalTypes = join(portal, 'src', 'shared-logic', 'public-api', 'public-api-types.ts');
const objectId = 'b88f8fdf-eaeb-46ef-86d6-0705af3cc663';
const structureUuid = '4ba6e5c6-3f31-45f2-93a0-27a8b2d91551';
const uploadId = '7d2e7f8a-4c3b-4e1d-9f0a-123456789abc';
const textBlock = {
  type: 'TextBlock',
  tokens: [{ type: 'TextToken', text: 'My note', style: {} }],
  hierarchy: { key: 'Base', val: 0 },
};

function fail(message) {
  console.error(message);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

if (!existsSync(join(root, 'dist', 'nodes', 'Capacities', 'Capacities.node.js'))) {
  fail('dist/ is missing. Run npm run build before checking requests.');
}
if (!existsSync(portalTypes)) {
  fail(`Public API schemas were not found at ${portalTypes}. Set CAPACITIES_PORTAL to the capacities-portal checkout.`);
}

const { Capacities } = require(join(root, 'dist', 'nodes', 'Capacities', 'Capacities.node.js'));
const { CapacitiesClient } = require(join(root, 'dist', 'nodes', 'Capacities', 'client', 'client.js'));
const node = new Capacities();
const fixtures = [];

function operationOptions(resource) {
  return node.description.properties.find(
    (property) => property.name === 'operation' && property.displayOptions?.show?.resource?.[0] === resource,
  );
}

const mediaOperation = operationOptions('media');
assert(mediaOperation?.options?.length === 1, 'Media should expose one operation');
assert(mediaOperation.options[0].value === 'upload', 'Media operation should be upload');
assert(mediaOperation.options[0].action === 'Upload media', 'Media action should be Upload media');
assert(
  !operationOptions('object').options.some((option) => option.value === 'createFromMedia'),
  'Object should not expose Create From Media',
);

const objectStructureId = node.description.properties.find(
  (property) => property.name === 'structureId' && property.displayOptions?.show?.resource?.[0] === 'object',
);
assert(objectStructureId?.default === 'RootPage', 'Object create Structure ID should default to RootPage');

function record(name, schema, data) {
  fixtures.push({ name, schema, data });
}

async function execute(parameters, items = [{ json: {} }], respond = async () => ({})) {
  const calls = [];
  const context = {
    getInputData: () => items,
    getCredentials: async () => ({ baseUrl: 'https://api.capacities.io' }),
    getNode: () => ({ name: 'Capacities' }),
    getNodeParameter(name, _index, fallback) {
      if (Object.prototype.hasOwnProperty.call(parameters, name)) return parameters[name];
      if (arguments.length >= 3) return fallback;
      throw new Error(`Missing parameter ${name}`);
    },
    helpers: {
      httpRequestWithAuthentication: async (_credentialType, options) => {
        calls.push(options);
        return respond(options, calls);
      },
      getBinaryDataBuffer: async () => Buffer.from('hello!!'),
    },
  };
  const output = await node.execute.call(context);
  return { calls, output };
}

function requestBody(calls, path) {
  const match = calls.find((call) => call.url === `https://api.capacities.io${path}`);
  assert(match, `No request to ${path}`);
  assert(match.headers?.['Content-Type'] === 'application/json', `${path} was not sent as JSON`);
  assert(match.body && typeof match.body === 'object' && !Buffer.isBuffer(match.body), `${path} body was not an object`);
  return match.body;
}

const dailyNoteFromFields = await execute({
  resource: 'blocks',
  operation: 'dailyNoteAppend',
  appendContent: 'markdown',
  appendMarkdown: 'Hello there',
  noTimeStamp: false,
  date: '',
  body: '{}',
});
record(
  'daily note markdown field',
  'saveToDailyNoteBodySchema',
  requestBody(dailyNoteFromFields.calls, '/blocks/daily-note/append'),
);

const dailyNoteFromLegacyJson = await execute({
  resource: 'blocks',
  operation: 'dailyNoteAppend',
  appendContent: 'markdown',
  appendMarkdown: '',
  date: '',
  body: JSON.stringify({
    blocks: [textBlock],
  }),
});
const legacyDailyNote = requestBody(dailyNoteFromLegacyJson.calls, '/blocks/daily-note/append');
assert(Array.isArray(legacyDailyNote.blocks), 'A saved blocks JSON body was not sent');
assert(legacyDailyNote.markdown === undefined, 'Blocks append also sent markdown');
record('daily note blocks from saved JSON', 'saveToDailyNoteBodySchema', legacyDailyNote);

const appended = await execute({
  resource: 'blocks',
  operation: 'append',
  objectId,
  appendContent: 'markdown',
  appendMarkdown: 'Hello there',
  body: '{}',
});
record('append markdown', 'appendBlocksRequestSchema', requestBody(appended.calls, '/blocks/append'));

const createdPage = await execute({
  resource: 'object',
  operation: 'create',
  structureId: 'RootPage',
  body: '{}',
});
record('create RootPage', 'createObjectBodySchema', requestBody(createdPage.calls, '/object'));

const createdCustom = await execute({
  resource: 'object',
  operation: 'create',
  structureId: structureUuid,
  body: '{}',
});
record('create structure UUID', 'createObjectBodySchema', requestBody(createdCustom.calls, '/object'));

const markdownCreated = await execute({
  resource: 'markdown',
  operation: 'create',
  structureId: 'RootPage',
  markdown: 'Hello there',
});
record(
  'create markdown RootPage',
  'createObjectMarkdownBodySchema',
  requestBody(markdownCreated.calls, '/object/markdown'),
);

const listed = await execute({
  resource: 'objects',
  operation: 'structure',
  id: 'RootPage',
});
const listCall = listed.calls.find((call) => call.url === 'https://api.capacities.io/objects/structure');
assert(listCall, 'No request to /objects/structure');
assert(listCall.qs?.id === 'RootPage', 'List by structure did not send RootPage');
assert(listCall.qs.cursor === undefined, 'List by structure sent an empty cursor');
record('list RootPage', 'listObjectsByStructureParamsSchema', listCall.qs);

const listedUuid = await execute({
  resource: 'objects',
  operation: 'structure',
  id: structureUuid,
});
record(
  'list structure UUID',
  'listObjectsByStructureParamsSchema',
  listedUuid.calls.find((call) => call.url.endsWith('/objects/structure')).qs,
);

const uploaded = await execute(
  {
    resource: 'media',
    operation: 'upload',
    binaryPropertyName: 'data',
    fileName: 'note.png',
    title: 'Note',
    collections: '',
  },
  [{ json: {}, binary: { data: { fileName: 'note.png', mimeType: 'image/png' } } }],
  async (options) => {
    if (options.method === 'POST' && options.url.endsWith('/object/media/upload')) {
      return { id: uploadId, partSize: 4, partCount: 2 };
    }
    return { id: uploadId, structureId: 'MediaImage' };
  },
);
const initCall = uploaded.calls.find((call) => call.method === 'POST' && call.url.endsWith('/object/media/upload'));
const partCalls = uploaded.calls.filter((call) => call.method === 'PUT');
const completeCall = uploaded.calls.find((call) => call.url.endsWith('/object/media/upload/complete'));
assert(initCall && partCalls.length === 2 && completeCall, 'Media upload did not run init, two parts, and complete');
assert(
  partCalls.every((call) => call.json === false && call.headers?.['Content-Type'] === 'application/octet-stream'),
  'Media parts were not uploaded as bytes',
);
assert(!uploaded.calls.some((call) => call.url.endsWith('/abort')), 'Successful upload aborted');
record('media init', 'initMediaUploadBodySchema', initCall.body);
record('media part 1', 'uploadMediaPartParamsSchema', partCalls[0].qs);
record('media part 2', 'uploadMediaPartParamsSchema', partCalls[1].qs);
record('media complete', 'completeMediaUploadBodySchema', completeCall.body);

let abortCalls = [];
try {
  await execute(
    {
      resource: 'media',
      operation: 'upload',
      binaryPropertyName: 'data',
      fileName: 'note.png',
      title: '',
      collections: '',
    },
    [{ json: {}, binary: { data: { fileName: 'note.png', mimeType: 'image/png' } } }],
    async (options) => {
      abortCalls.push(options);
      if (options.method === 'PUT') throw new Error('part failed');
      if (options.method === 'POST' && options.url.endsWith('/object/media/upload')) {
        return { id: uploadId, partSize: 4, partCount: 2 };
      }
      return {};
    },
  );
  fail('A failed media part should abort the upload');
} catch (error) {
  if (error.message === 'A failed media part should abort the upload') throw error;
}
assert(
  abortCalls.some((call) => call.method === 'POST' && call.url.endsWith('/object/media/upload/abort')),
  'Failed media upload did not abort',
);

const clientCalls = [];
const client = new CapacitiesClient(
  'https://api.capacities.io',
  async (options) => {
    clientCalls.push(options);
    return {};
  },
  { name: 'Capacities' },
);
await client.blocks.dailyNote.append('{"markdown":"Hello there","noTimeStamp":false}');
const parsedStringBody = clientCalls[0];
assert(parsedStringBody.body?.markdown === 'Hello there', 'A JSON string body was not parsed');
assert(parsedStringBody.headers?.['Content-Type'] === 'application/json', 'A JSON string body was not sent as JSON');
record('parsed JSON string daily note', 'saveToDailyNoteBodySchema', parsedStringBody.body);

fixtures.push(
  { name: 'empty daily note is rejected', schema: 'saveToDailyNoteBodySchema', data: {}, expect: 'fail' },
  {
    name: 'blocks and markdown together are rejected',
    schema: 'saveToDailyNoteBodySchema',
    data: { markdown: 'Hello', blocks: [textBlock] },
    expect: 'fail',
  },
);

const fixturesDir = mkdtempSync(join(tmpdir(), 'capacities-n8n-contract-'));
const fixturesPath = join(fixturesDir, 'fixtures.json');
writeFileSync(fixturesPath, JSON.stringify(fixtures));

const contract = spawnSync(
  process.execPath,
  ['--loader', 'ts-node/esm', '--no-warnings', join(root, 'scripts', 'check-api-contract.mjs')],
  {
    cwd: portal,
    stdio: 'inherit',
    env: {
      ...process.env,
      CAPACITIES_PORTAL: portal,
      CONTRACT_FIXTURES: fixturesPath,
    },
  },
);
if (contract.status !== 0) process.exit(contract.status ?? 1);

console.log(`Request checks passed (${fixtures.length} payloads)`);
