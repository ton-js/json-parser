
import { strict as assert } from 'node:assert';

import '@ton.js/json-parse-polyfill';
import type { ReviverFunc } from '@ton.js/json-parse-polyfill';


interface DocumentType {
  foo: {
    bar: {
      value: bigint;
    };
  };
}

const content = '{ "foo": { "bar": { "value": 12345678901234567890 } } }';

const reviver: ReviverFunc = (key, value, context) => (
  ((context.keys.join('.') === 'foo.bar.value')
    ? BigInt(context.source)
    : value
  )
);

const object = <DocumentType> (
  JSON.parse(content, reviver as any)
);

assert.equal(typeof object.foo.bar.value, 'bigint');

console.log(`value = ${object.foo.bar.value}`);
