
import '@ton.js/json-parse-polyfill';

import { strict as assert } from 'node:assert';

import { doParse } from './do-parse.js';


/**
 * This examples tests global type declaration loading and
 * propagation to other TypeScript modules (do-parse.ts).
 */


interface DocumentType {
  valueBN: bigint;
}


const object = doParse<DocumentType>('{ "valueBN": 12345678901234567890 }');

assert.equal(typeof object.valueBN, 'bigint');

console.log(`valueBN = ${object.valueBN}`);
