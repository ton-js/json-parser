
<a name="usage-rules"></a>
## Parsing by rules

A dedicated package is provided to support JSON
deserialization using a special rules syntax. This
simplifies writing custom revivers for your data types.


### Prerequisites

> This package requires a `JSON.parse` implementation that
  supports TC39 [source access proposal][tc39-proposal] and
  additional features. You can either
  [install the polyfill](#usage-polyfill)
  or specify the parser function directly via the options.

Install the package:

```sh
npm install --save @ton.js/json-parser-rules
```

### Example

Please see the [parse by rules example project][examples-rules]
for the complete examples.

```ts
import '@ton.js/json-parse-polyfill';

import { strict as assert } from 'node:assert';

import type { Reviver } from '@ton.js/json-parser-rules';
import { parseJsonSchema } from '@ton.js/json-parser-rules';


//===============//
// JSON DOCUMENT //
//===============//

const content = (`
{
  "foo": {
    "hex": {
      "value": "416C6C20796F75206E656564206973206C6F7665"
    },
    "bar": {
      "baz": {
        "valueBig": 11145678901234567890,
        "hex": "466f72204169757221"
      }
    },
    "feeBig": 22245678901234567890,
    "myArray": [0, 1, "2023-01-20T19:30:45.904Z", 3, {
      "hex": {
        "value": "616c6c20796f75722062617365206172652062656c6f6e6720746f207573"
      }
    }]
  }
}
`);


//==================//
// RESULT INTERFACE //
//==================//

interface ParseResult {
  foo: {
    hex: HexBag;
    bar: {
      baz: {
        valueBig: bigint;
        hex: string;
      };
    };
    feeBig: bigint;
    myArray: [number, number, Date, number, {
      hex: HexBag;
    }];
  };
}

interface HexBag {
  value: string;
}


//==========//
// REVIVERS //
//==========//

const bigIntReviver: Reviver = (
  context => BigInt(context.source)
);

const dateReviver: Reviver = (
  context => new Date(context.value)
);

const hexReviver: Reviver = (
  context => Buffer.from(context.value, 'hex').toString()
);


//==================//
// PARSING BY RULES //
//==================//

const object = parseJsonByRules<ParseResult>(content, {
  rules: [{
    pattern: '**.*Big',
    reviver: bigIntReviver,
  }, {
    pattern: [
      '**.hex.value',
      'foo.bar.baz.hex',
    ],
    reviver: hexReviver,
  }, {
    pattern: 'foo.myArray.2',
    reviver: dateReviver,
  }],
});


//=================//
// TESTING RESULTS //
//=================//

assert.equal(typeof object.foo.bar.baz.valueBig, 'bigint');
assert.equal(object.foo.bar.baz.valueBig, 11145678901234567890n);

assert.equal(typeof object.foo.feeBig, 'bigint');
assert.equal(object.foo.feeBig, 22245678901234567890n);

assert.equal(
  object.foo.hex.value,
  'All you need is love'
);

assert.equal(
  object.foo.bar.baz.hex,
  'For Aiur!'
);

assert.equal(
  object.foo.myArray[4].hex.value,
  'all your base are belong to us'
);

assert.equal(
  object.foo.myArray[2].toISOString(),
  '2023-01-20T19:30:45.904Z'
);
```

If you don't want to use the polyfill you can do this instead:

```ts
import { parseJson } from '@ton.js/json-parser';
import { parseJsonByRules } from '@ton.js/json-parser-rules';

const result = parseJsonByRules('{ … }', {
  rules: [],
  parser: parseJson,
});
```


### API

> `parseJsonByRules<Type>(source, options): Type;`

Parses the specified JSON document according to the provided
deserialization rules.

| Property           | Type            | Description                                         |
|--------------------|-----------------|-----------------------------------------------------|
| `* source`         | `string`        | The JSON document to parse.                         |
| `* options`        | `Options`       | An options object.                                  |
| `* options.rules`  | `ReviverRule[]` | A list of parsing rules.                            |
| `  options.parser` | `ParserFunc`    | An optional `JSON.parse` compatible implementation. |

> `ReviverRule`

Specifies the reviver function that needs to be applied for
the specified patterns.

| Property    | Type                    | Description                                                           |
|-------------|-------------------------|-----------------------------------------------------------------------|
| `* pattern` | `string` or `string[]`  | A pattern or a list of patterns to match against parsing object keys. |
| `* reviver` | `Reviver`               | A reviver function to apply when the pattern is getting matched.      |

> `Reviver = (context: ReviverContext) => any`

Reviver is a callback function that is getting called to
deserialize specific key-value pairs from the JSON document.
It must return the deserialized value.

> `ReviverContext`

Reviver function will return a context object with the
following information that can be used to deserialize the
document data.

| Property | Type     | Description                           |
|----------|----------|---------------------------------------|
| `value`  | `any`    | A parsed value.                       |
| `source` | `string` | An original source text of the value. |
| `path`   | `string` | A path of keys delimited by dots.     |


### Rule format

The following rule formats are supported:

| Pattern              | Description                                                                                        |
| -------------------- |----------------------------------------------------------------------------------------------------|
| `foo.bar.baz`        | A direct key path that is getting matched exactly.                                                 |
| `foo.*.bar`          | The `*` part will match anything except the dot, e.g.: `foo.baz.bar`, `foo.qux.bar`                |
| `foo.date*`          | This will match any keys under the `foo` that start with `date`, e.g. `foo.dateCreated`            |
| `foo.*Date`          | This will match any keys under the `foo` that end with `Date`, e.g. `foo.expirationDate`           |
| `**`                 | This will apply to all the keys                                                                    |
| `**.foo`             | This will match all the `foo` keys nested in the object, e.g. `my.deeply.nested.foo` or `foo`      |
| `foo.bar.**`         | This will match every key under the `foo.bar` path, e.g. `foo.bar.qux.quux`                        |
| `foo.*.bar.**.*Date` | This will match all the keys ending with `Date` under the `foo.X.bar`, where `X` could be anything |
