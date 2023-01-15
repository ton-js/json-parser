
import { strict as assert } from 'node:assert';

import '@ton.js/json-parse-polyfill';


interface DocumentType {
  birthDate: Date;
}

const content = '{ "birthDate": "1989-08-16T10:20:30.123Z" }';

const object = <DocumentType> JSON.parse(content, (key, value) => (
  (key.endsWith('Date') ? new Date(value) : value)
));

assert(object.birthDate instanceof Date);

console.log(`timestamp = ${object.birthDate.getTime()}`);
