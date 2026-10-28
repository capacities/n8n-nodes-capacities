import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const portal = process.env.CAPACITIES_PORTAL;
const fixturesPath = process.env.CONTRACT_FIXTURES;
if (!portal || !fixturesPath) {
  console.error('CAPACITIES_PORTAL and CONTRACT_FIXTURES are required');
  process.exit(1);
}

const schemas = await import(pathToFileURL(`${portal}/src/shared-logic/public-api/public-api-types.ts`).href);
const fixtures = JSON.parse(readFileSync(fixturesPath, 'utf8'));
let failed = 0;

for (const fixture of fixtures) {
  const schema = schemas[fixture.schema];
  if (!schema?.safeParse) {
    console.error(`${fixture.name}: unknown schema ${fixture.schema}`);
    failed += 1;
    continue;
  }

  const result = schema.safeParse(fixture.data);
  const passed = result.success === (fixture.expect !== 'fail');
  if (passed) {
    console.log(`${fixture.name} ok`);
    continue;
  }

  failed += 1;
  const detail = result.success
    ? 'expected the API schema to reject this payload'
    : result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`).join('; ');
  console.error(`${fixture.name} failed: ${detail}`);
}

if (failed > 0) {
  console.error(`${failed} API contract check${failed === 1 ? '' : 's'} failed`);
  process.exit(1);
}

console.log(`API contract checks passed (${fixtures.length})`);
