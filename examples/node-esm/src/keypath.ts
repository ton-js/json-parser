
import { strict as assert } from 'node:assert';

import { parseJson } from '@ton.js/json-parser';


interface DocumentType {
  foo: {
    bar: {
      value: bigint;
    };
  };
}

const content = '{ "foo": { "bar": { "value": 12345678901234567890 } } }';

const object = parseJson<DocumentType>(content, (key, value, context) => (
  (context.keys.join('.') === 'foo.bar.value' ? BigInt(context.source) : value)
));

assert.equal(typeof object.foo.bar.value, 'bigint');

console.log(`value = ${object.foo.bar.value}`);
