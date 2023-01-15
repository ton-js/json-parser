
import { dirname, join as pathJoin } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { expect } from 'chai';

import { parseJson } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplesPath = pathJoin(__dirname, 'samples/');

const fileNames = await readdir(samplesPath);


describe('test samples', () => {

  for (const filename of fileNames) {

    it(`${filename}`, async () => {
      const filePath = pathJoin(samplesPath, filename);
      const source = await readFile(filePath, 'utf-8');
      const data1 = JSON.parse(source);
      const data2 = parseJson(source);
      expect(data1).to.deep.equal(data2);
    });

  }

});
