import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('shared Swift selection controls in a native host', { timeout: 120_000 }, () => {
  const result = spawnSync('swift', ['test', '--filter', 'SelectionTests'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    encoding: 'utf8',
    env: { ...process.env, SM_NATIVE_MOUSE_TESTS: '1' },
    timeout: 110_000,
    maxBuffer: 8 * 1024 * 1024,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout + result.stderr, /nativeMouseActivationAndExternalSelection\(\) passed/,
    'The native mouse test must execute, not merely compile or skip.');
});
