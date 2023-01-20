
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join as pathJoin } from 'node:path';
import { fileURLToPath } from 'node:url';


import nunjucks from 'nunjucks';
import * as cheerio from 'cheerio';
import { minify as minifyHtml } from 'html-minifier-terser';

import { remark } from 'remark';
import remarkToc from 'remark-toc';
import remarkValidateLinks from 'remark-validate-links';

import manifest from '../packages/json-parser/package.json' assert { type: 'json' };


const __dirname = dirname(
  fileURLToPath(import.meta.url)
);

const rootPath = pathJoin(__dirname, '/..');
const templatePath = pathJoin(__dirname, 'src/index.md');
const outputPath = pathJoin(__dirname, '../README.md');


console.log('Building the README file…');

console.log('Compiling nunjucks template…');

const benchmarks = await loadBenchmarks();

let source = nunjucks.render(templatePath, {
  packageName: manifest.name,
  copyright: {
    years: renderYears(2023),
    entity: '💎 TON FOUNDATION',
  },
  benchmarks,
});

console.log('Applying remark transforms…');

const processor = (remark()
  .use(remarkToc, {
    heading: 'Contents',
    tight: true,
    skip: '.*License.*',
  })
  .use(remarkValidateLinks)
);

const result = await processor.process(source);

result.messages.forEach(message => console.log(message));

source = result.toString();

await writeFile(outputPath, source, 'utf-8');

console.log(`Written README file to:\n${outputPath}`);


function renderYears(startYear: number): string {
  const currentYear = new Date().getFullYear();
  return ((currentYear === startYear)
    ? currentYear.toString()
    : `${startYear}—${currentYear}`
  );
}

async function loadBenchmarks(): Promise<string> {

  let source = '';

  source += await loadBenchmark({
    name: 'normal-dataset',
    title: 'Normal dataset',
  });

  source += '\n\n';

  source += await loadBenchmark({
    name: 'big-dataset',
    title: 'Big dataset',
  });

  return source;

}

async function loadBenchmark(args: {
  name: string;
  title: string;

}): Promise<string> {

  const filePath = pathJoin(
    rootPath,
    'benchmark/results',
    `${args.name}.table.html`
  );

  const $ = cheerio.load(
    await readFile(filePath, 'utf-8')
  );

  let tableContent = $.html($('table'));
  if (!tableContent) {
    throw new Error(`Failed to parse <table> out of benchmark content`);
  }

  tableContent = await minifyHtml(tableContent, {
    collapseWhitespace: true,
  });

  return `### ${args.title}\n\n${tableContent}`;

}
