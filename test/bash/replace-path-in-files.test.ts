import { test, expect } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

test.skip('Replace a path in multiple files', () => {
  const dir = prepareDirectory();
  execSync(
    [
      `sed -i '.bak' 's/\\/app\\/node_modules\\/matterbridge-home-assistant/\\/usr\\/local\\/lib\\/node_modules\\/matterbridge-home-assistant/g' ${dir}/*`,
      `rm -r ${dir}/*.bak`,
    ].join('; '),
  );
  const fileNames = fs.readdirSync(dir, { recursive: true, withFileTypes: true }).map((file) => dir + '/' + file.name);
  const content = Object.fromEntries(
    fileNames.map((fileName) => [path.basename(fileName), JSON.parse(fs.readFileSync(fileName, 'utf-8'))]),
  );
  fs.rmSync(dir, { force: true, recursive: true });

  expect(content).toEqual({
    'fileA.json': {
      key: 'value',
      second: '/usr/local/lib/node_modules/matterbridge-home-assistant',
    },
    'fileB.json': {
      key1: 'value1',
      second: 'third',
    },
    'fileC.json': {
      any: '/usr/local/lib/node_modules/matterbridge-home-assistant',
      key3: 'value2',
      second: 'third',
    },
  });
});

function prepareDirectory(): string {
  const dir = fs.mkdtempSync(os.tmpdir());
  const files: Record<string, object> = {
    'fileA.json': {
      key: 'value',
      second: '/app/node_modules/matterbridge-home-assistant',
    },
    'fileB.json': {
      key1: 'value1',
      second: 'third',
    },
    'fileC.json': {
      any: '/app/node_modules/matterbridge-home-assistant',
      key3: 'value2',
      second: 'third',
    },
  };
  Object.entries(files).forEach(([fileName, content]) => {
    fs.writeFileSync(`${dir}/${fileName}`, JSON.stringify(content));
  });
  return dir;
}
