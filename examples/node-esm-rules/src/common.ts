
import type { Reviver, ReviverRule } from '@ton.js/json-parser-rules';
import { strict as assert } from 'assert';


//===============//
// JSON DOCUMENT //
//===============//

export const content = (`
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

export interface ParseResult {
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

export interface HexBag {
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


//=======//
// RULES //
//=======//

export const rules: ReviverRule[] = [{
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
}];


//=================//
// TESTING RESULTS //
//=================//

export function testResults(object: ParseResult) {

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

}
