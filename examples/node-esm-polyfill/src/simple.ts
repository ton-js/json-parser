
import '@ton.js/json-parse-polyfill';


interface DocumentType {
  greeting: string;
  name: string;
}

const content = '{ "greeting": "Hello", "name": "John" }';

const object = JSON.parse(content) as DocumentType;

console.log(`${object.greeting} ${object.name}!`);
