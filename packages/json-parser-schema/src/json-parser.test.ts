
import { expect } from 'chai';
import { suite, test } from 'mocha';

import { parseJsonSchema } from './index.js';


suite('parseJsonSchema()', () => {

  test('simple pattern', () => {

    const source = (
      '{ "foo": { "bar": { "baz": 12345678901234567890 } } }'
    );

    interface Object {
      foo: {
        bar: {
          baz: bigint;
        };
      };
    }

    const object = parseJsonSchema<Object>(source, {
      rules: [{
        pattern: 'foo.bar.baz',
        reviver: context => BigInt(context.source),
      }],
    });

    (expect(object.foo.bar.baz)
      .to.equal(12345678901234567890n)
    );

  });

  test('multiple patterns', () => {

    const source = (
      '{ "foo": { "bar": { "baz": 12345678901234567890 }, "qux": { "quux": 12345678901234567890123 } } }'
    );

    interface Object {
      foo: {
        bar: {
          baz: bigint;
        };
        qux: {
          quux: bigint;
        };
      };
    }

    const object = parseJsonSchema<Object>(source, {
      rules: [{
        pattern: [
          'foo.bar.baz',
          'foo.qux.quux',
        ],
        reviver: context => BigInt(context.source),
      }],
    });

    (expect(object.foo.bar.baz)
      .to.equal(12345678901234567890n)
    );

    (expect(object.foo.qux.quux)
      .to.equal(12345678901234567890123n)
    );

  });

  test('multiple rules', () => {

    const source = (
      '{"date":"2023-01-16T04:09:53.875Z","foo":{"bar":{"baz":12345678901234567890,"qux":"2023-01-16T04:02:36.815Z"}}}'
    );

    interface Object {
      date: Date;
      foo: {
        bar: {
          baz: bigint;
          qux: Date;
        };
      };
    }

    const object = parseJsonSchema<Object>(source, {
      rules: [{
        pattern: 'foo.bar.baz',
        reviver: context => BigInt(context.source),
      }, {
        pattern: ['date', 'foo.bar.qux'],
        reviver: context => new Date(context.value),
      }],
    });

    (expect(object.foo.bar.baz)
      .to.equal(12345678901234567890n)
    );

    expect(object.date).to.be.instanceOf(Date);
    (expect(object.date.toISOString())
      .to.equal('2023-01-16T04:09:53.875Z')
    );

    expect(object.foo.bar.qux).to.be.instanceOf(Date);
    (expect(object.foo.bar.qux.toISOString())
      .to.equal('2023-01-16T04:02:36.815Z')
    );

  });

  test('wildcard keys', () => {

    // {
    //     "foo": {
    //         "bar": {
    //             "value": 12345678901234567890,
    //             "other": 12345678901234567890,
    //             "date": "2023-01-16T04:45:17.618Z"
    //         },
    //         "baz": {
    //             "value": 12345678901234567890123,
    //             "other": 12345678901234567890123
    //         }
    //     },
    //     "qux": {
    //         "quux": {
    //             "value": 12345678901234567890,
    //             "other": 12345678901234567890,
    //             "date": "2023-01-16T04:44:23.939Z"
    //         }
    //     }
    // }

    const source = (
      '{"foo":{"bar":{"value":12345678901234567890,"other":12345678901234567890,"date":"2023-01-16T04:45:17.618Z"},"baz":{"value":12345678901234567890123,"other":12345678901234567890123}},"qux":{"quux":{"value":12345678901234567890,"other":12345678901234567890,"date":"2023-01-16T04:44:23.939Z"}}}'
    );

    interface Result {
      foo: {
        bar: {
          value: bigint;
          other: number;
          date: Date;
        };
        baz: {
          value: bigint;
          other: number;
        };
      };
      qux: {
        quux: {
          value: bigint;
          other: number;
          date: Date;
        };
      };
    }

    const result = parseJsonSchema<Result>(source, {
      rules: [{
        pattern: 'foo.*.value',
        reviver: context => BigInt(context.source),
      }, {
        pattern: '*.*.date',
        reviver: context => new Date(context.value),
      }],
    });

    (expect(result.foo.bar.value)
      .to.equal(12345678901234567890n) // < BN
    );

    (expect(result.foo.bar.other)
      .to.equal(12345678901234567000)
    );

    (expect(result.foo.baz.value)
      .to.equal(12345678901234567890123n) // < BN
    );

    (expect(result.foo.baz.other)
      .to.equal(1.2345678901234568e+22)
    );

    expect(result.foo.bar.date).to.be.instanceOf(Date);
    (expect(result.foo.bar.date.toISOString())
      .to.equal('2023-01-16T04:45:17.618Z')
    );

    expect(result.qux.quux.date).to.be.instanceOf(Date);
    (expect(result.qux.quux.date.toISOString())
      .to.equal('2023-01-16T04:44:23.939Z')
    );

  });

  test.only('any depths wildcards', () => {

    // {
    //     "noskip": {
    //         "foo": {
    //             "bar": {
    //                 "baz": {
    //                     "bn": 11145678901234567890,
    //                     "other": 11145678901234567890,
    //                     "date": "2023-01-16T05:05:01.040Z",
    //                     "binary": {
    //                         "hex": "68656c6c6f20776f726c64",
    //                         "skip": {
    //                             "hex": "646f6e2774206d61746368"
    //                         }
    //                     }
    //                 }
    //             }
    //         },
    //         "red": {
    //             "blue": {
    //                 "bn": 22245678901234567890,
    //                 "other": 22245678901234567890
    //             }
    //         },
    //         "winter": {
    //             "bn": 33345678901234567890,
    //             "other": 33345678901234567890,
    //             "binary": {
    //                 "value": "77696e74657220697320636f6d696e67"
    //             }
    //         }
    //     },
    //     "skip": {
    //         "apple": {
    //             "bn": 44445678901234567890,
    //             "other": 44445678901234567890,
    //             "date": "2023-01-16T05:05:19.584Z",
    //             "binary": {
    //                 "HEX": "616c6c20796f75206e656564206973206c6f7665"
    //             }
    //         }
    //     }
    // }

    const source = (
      '{"noskip":{"foo":{"bar":{"baz":{"bn":11145678901234567890,"other":11145678901234567890,"date":"2023-01-16T05:05:01.040Z","binary":{"hex":"68656c6c6f20776f726c64","skip":{"hex":"646f6e2774206d61746368"}}}}},"red":{"blue":{"bn":22245678901234567890,"other":22245678901234567890}},"winter":{"bn":33345678901234567890,"other":33345678901234567890,"binary":{"value":"77696e74657220697320636f6d696e67"}}},"skip":{"apple":{"bn":44445678901234567890,"other":44445678901234567890,"date":"2023-01-16T05:05:19.584Z","binary":{"HEX":"616c6c20796f75206e656564206973206c6f7665"}}}}'
    );

    interface Result {
      noskip: {
        foo: {
          bar: {
            baz: {
              bn: bigint;
              other: number;
              date: Date;
              binary: {
                hex: string;
                skip: {
                  hex: string;
                };
              };
            }
          }
        },
        red: {
          blue: {
            bn: bigint;
            other: number;
          }
        },
        winter: {
          bn: bigint;
          other: number;
          binary: {
            value: string;
          };
        }
      };
      skip: {
        apple: {
          bn: bigint;
          other: number;
          date: Date;
          binary: {
            HEX: string;
          };
        }
      },
    }

    const result = parseJsonSchema<Result>(source, {
      rules: [{
        pattern: 'noskip.**.bn',
        reviver: context => BigInt(context.source),
      }, {
        pattern: '**.date',
        reviver: context => new Date(context.value),
      }, {
        pattern: '**.binary.*',
        reviver: context => (typeof context.value === 'string' ?
          Buffer.from(context.value, 'hex').toString() :
          context.value
        ),
      }],
    });

    (expect(result.noskip.foo.bar.baz.bn)
      .to.equal(11145678901234567890n) // < BN
    );

    (expect(result.noskip.foo.bar.baz.other)
      .to.equal(11145678901234567000)
    );

    (expect(result.noskip.red.blue.bn)
      .to.equal(22245678901234567890n) // < BN
    );

    (expect(result.noskip.red.blue.other)
      .to.equal(22245678901234570000)
    );

    (expect(result.noskip.winter.bn)
      .to.equal(33345678901234567890n) // < BN
    );

    (expect(result.noskip.winter.other)
      .to.equal(33345678901234570000)
    );

    (expect(result.skip.apple.bn)
      .to.equal(44445678901234565000)
    );

    (expect(result.skip.apple.other)
      .to.equal(44445678901234565000)
    );

    expect(result.noskip.foo.bar.baz.date).to.be.instanceOf(Date);
    (expect(result.noskip.foo.bar.baz.date.toISOString())
      .to.equal('2023-01-16T05:05:01.040Z')
    );

    expect(result.skip.apple.date).to.be.instanceOf(Date);
    (expect(result.skip.apple.date.toISOString())
      .to.equal('2023-01-16T05:05:19.584Z')
    );

    (expect(result.noskip.foo.bar.baz.binary.hex)
      .to.equal('hello world')
    );

    (expect(result.noskip.foo.bar.baz.binary.skip.hex)
      .to.equal('646f6e2774206d61746368')
    );

    (expect(result.noskip.winter.binary.value)
      .to.equal('winter is coming')
    );

    (expect(result.skip.apple.binary.HEX)
      .to.equal('all you need is love')
    );

  });

});
