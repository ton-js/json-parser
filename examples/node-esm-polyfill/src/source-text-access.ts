
import { strict as assert } from 'node:assert';

import '@ton.js/json-parse-polyfill';
import type { ReviverFunc } from '@ton.js/json-parse-polyfill';


interface DocumentType {
  valueBN: bigint;
}


const content = '{ "valueBN": 12345678901234567890 }';

const reviver: ReviverFunc = (key, value, context) => (
  (key.endsWith('BN') ? BigInt(context.source) : value)
);

const object = <DocumentType> (
  JSON.parse(content, reviver as any)
);

assert.equal(typeof object.valueBN, 'bigint');

console.log(`valueBN = ${object.valueBN}`);
