
import { parseJson } from '@ton.js/json-parser';


const content = '{ "foo": true, "__proto__": {} }';

try {
  parseJson(content, undefined, {
    throwOnProto: true,
  });

} catch (error: any) {
  // Forbidden object property name: "__proto__"
  console.log(error);

}
