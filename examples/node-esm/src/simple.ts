
import { parseJson } from '@ton.js/json-parser';

interface DocumentType {
  greeting: string;
  name: string;
}

const content = '{ "greeting": "Hello", "name": "John" }';

const object = parseJson<DocumentType>(content);

console.log(`${object.greeting} ${object.name}!`);
