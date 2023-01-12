
import { readFile } from 'node:fs/promises';
import { dirname, join as pathJoin } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as benny from 'benny';

import { parseJson } from '@ton.js/json-parser';

import manifest from '../package/package.json' assert { type: 'json' };


const __dirname = dirname(
  fileURLToPath(import.meta.url)
);

const outputPath = pathJoin(__dirname, 'results');


createSuite(
  'big-dataset',
  await loadDataset('history.json')
);

createSuite(
  'normal-dataset',
  await loadDataset('transactions.json')
);


async function loadDataset(filename: string): Promise<string> {
  const filePath = pathJoin(__dirname, 'samples/', filename);
  return readFile(filePath, 'utf-8');
}

function createSuite(name: string, dataset: string) {

  benny.suite(

    name,

    benny.add('native', () => {
      JSON.parse(dataset);
    }),

    benny.add('parse-json', () => {
      parseJson(dataset);
    }),

    benny.cycle(),

    benny.complete(),

    benny.save({
      folder: outputPath,
      file: name,
      format: 'json',
      version: manifest.version,
    }),

    benny.save({
      folder: outputPath,
      file: name,
      format: 'chart.html',
      version: manifest.version,
    }),

    benny.save({
      folder: outputPath,
      file: name,
      format: 'table.html',
      version: manifest.version,
    }),

  );

}
