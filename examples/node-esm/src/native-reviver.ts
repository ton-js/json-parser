
import { strict as assert } from 'node:assert';

import { parseJson } from '@ton.js/json-parser';


interface DocumentType {
  birthDate: Date;
}

const content = '{ "birthDate": "1989-08-16T10:20:30.123Z" }';

const object = parseJson<DocumentType>(content, (key, value) => (
  (key.endsWith('Date') ? new Date(value) : value)
));

assert(object.birthDate instanceof Date);

console.log(`timestamp = ${object.birthDate.getTime()}`);
