
import { strict as assert } from 'node:assert';

import { parseJson } from '@ton.js/json-parser';


interface DocumentType {
  valueBN: bigint;
}


const content = '{ "valueBN": 12345678901234567890 }';

const object = parseJson<DocumentType>(content, (key, value, context) => (
  (key.endsWith('BN') ? BigInt(context.source) : value)
));

assert.equal(typeof object.valueBN, 'bigint');

console.log(`valueBN = ${object.valueBN}`);
