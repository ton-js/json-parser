
import { expect } from 'chai';

import { parseJson } from './json-parser.js';


type Tests = Array<[string, any]>;

type NativeReviver = (
  key: (string | undefined),
  value: any,

) => any;

type JsonParseFunc = (
  source: string,
  reviver: NativeReviver,

) => any;


const FAIL = Symbol('FAIL');

const tests: Record<string, Tests> = {
  numbers: [
    ['0', 0],
    ['-0', -0],
    ['1234567890', 1234567890],
    ['-1234567890', -1234567890],
    ['1234567890.1234567890', 1234567890.1234567890],
    ['-1234567890.1234567890', -1234567890.1234567890],
    ['0.0', 0],
    ['123e9', 123000000000],
    ['123e+9', 123000000000],
    ['123e-9', 0.000000123],
    ['123E9', 123000000000],
    ['123E+9', 123000000000],
    ['123E-9', 0.000000123],
    ['123.456e9', 123456000000],
    ['123.456e+9', 123456000000],
    ['123.456e-9', 0.000000123456],
    ['123.456E9', 123456000000],
    ['123.456E+9', 123456000000],
    ['123.456E-9', 0.000000123456],
    ['+0', FAIL],
    ['.0', FAIL],
    ['0123', FAIL],
  ],
  strings: [
    ['"hello"', 'hello'],
    ['"  hello  "', '  hello  '],
    ['"hel\\"lo"', 'hel"lo'],
    ['"hel\\\\lo"', 'hel\\lo'],
    ['"hel\/lo"', 'hel/lo'],
    ['"hel\\blo"', 'hel\blo'],
    ['"hel\\flo"', 'hel\flo'],
    ['"hel\\nlo"', 'hel\nlo'],
    ['"hel\\rlo"', 'hel\rlo'],
    ['"hel\\tlo"', 'hel\tlo'],
    ['"[\\u0057, \\u042F, \\u2605, \\uffFd]"', '[W, Я, ★, �]'],
    ['  "hello"  ', 'hello'],
    ['\r"hello"\r', 'hello'],
    ['\n"hello"\n', 'hello'],
    ['\t"hello"\t', 'hello'],
  ],
  keywords: [
    ['true', true],
    ['false', false],
    ['null', null],
    ['  null  ', null],
    ['\rnull\r', null],
    ['\nnull\n', null],
    ['\tnull\t', null],
  ],
  arrays: [
    ['[]', []],
    ['[1, 2, 3]', [1, 2, 3]],
    [
      '[-123.456e6,"hello",true,false,null]',
      [-123456000, 'hello', true, false, null]
    ],
    [
      ' \r \n \t [ \r \n \t "hello" \r \n \t , \r \n \t "world" \r \n \t ] \r \n \t',
      ['hello', 'world']
    ],
    ['["hello" "world"]', FAIL],
    ['["hello" 1]', FAIL],
    ['[true false]', FAIL],
    ['[,]', FAIL],
    ['[,,]', FAIL],
    ['[1, 2, 3,]', FAIL],
  ],
  objects: [
    ['{ "foo": "bar" }', {foo:'bar'}],
    ['{ "foo": -123.456e6 }', {foo:-123456000}],
    [
      '{ "foo": true, "bar": false, "qux": null }',
      { foo: true, bar: false, qux: null }
    ],
    ['{"compact":true,"foo":1}', { compact: true, foo: 1 }],
    ['{}', {}],
    ['{,}', FAIL],
    ['{,,}', FAIL],
    ['{:}', FAIL],
    ['{1:1}', FAIL],
    ['{foo:1}', FAIL],
    ['{ "foo": true, }', FAIL],
    ['{ "foo" true }', FAIL],
    ['{ "foo"::true }', FAIL],
    ['{ "foo", true: }', FAIL],
    [
      '\r \n \t { \r \n \t "foo" \r \n \t : \r \n \t true \r \n \t , \r \n \t "bar": \r \n \t 1 \r \n\ \t } \r \n \t ',
      { foo: true, bar: 1 }
    ],
    ['{"foo":true,"__proto__":"hello"}', { foo: true }],
  ],
  nested: [
    ['[[[[[]]]]]', [[[[[]]]]]],
    ['[[], []]', [[], []]],
    ['[1, [2], 3, [4], 5, [[0], [0]]]', [1, [2], 3, [4], 5, [[0], [0]]]],
    ['[{}, [[{}]], {}]', [{}, [[{}]], {}]],
    ['[{"foo": [1]}]', [{"foo": [1]}]],
    ['[{"foo": {"bar": [{}]}}]', [{"foo": {"bar": [{}]}}]],
  ],
};


describe('parseJson()', () => {

  for (const [group, cases] of Object.entries(tests)) {

    describe(`[${group}]`, () => {

      for (const [input, expected] of cases) {

        it(`[${input}]`, () => {

          if (expected === FAIL) {
            (expect(() => parseJson(input))
              .to.throw(SyntaxError)
            );

          } else {
            expect(parseJson(input)).to.deep.equal(expected);

          }

        });

      }

    });

  }

  describe('proto properties', () => {

    it('should throw on __proto__', () => {

      const callable = () => (
        parseJson('{ "__proto__": {} }', undefined, {
          throwOnProto: true,
        })
      );

      expect(callable).to.throw(
        SyntaxError,
        /Forbidden.*__proto__/
      );

    });

    it('should remove __proto__', () => {

      const result = parseJson(
        '{ "foo": true, "__proto__": {}, "bar": { "__proto__": {} } }'
      );

      expect(result).to.deep.equal({
        foo: true,
        bar: {},
      });

      expect(result.__proto__).to.equal(Object.prototype);
      expect(result.bar.__proto__).to.equal(Object.prototype);

    });

    it('should throw on constructor.prototype', () => {

      const callable = () => (
        parseJson('{ "constructor": { "prototype": {} } }', undefined, {
          throwOnProto: true,
        })
      );

      expect(callable).to.throw(
        SyntaxError,
        /Forbidden.*constructor\.prototype/
      );

    });

    it('should remove constructor.prototype', () => {

      const result = parseJson(
        '{ "foo": true, "constructor": { "prototype": {}, "baz": "hello" }, "bar": { "constructor": { "prototype": {} } } }'
      );

      expect(result).to.deep.equal({
        foo: true,
        constructor: {
          baz: 'hello',
        },
        bar: {
          constructor: {},
        },
      });

      expect(result.constructor.prototype).to.equal(undefined);
      expect(result.bar.constructor.prototype).to.equal(undefined);

    });

  });

  describe('reviver native behavior', () => {

    it('should delete undefined values', () => {

      const source = '{ "foo": true, "removeMe": 123, "arr": [{ "bar": 123, "removeMe": false }] }';

      const result = parseJson(source, (key, value) => (
        (key === 'removeMe' ? undefined : value)
      ));

      expect(result).to.deep.equal({
        foo: true,
        arr: [{
          bar: 123,
        }],
      });

    });

    it('should transform values', () => {

      const source = '{ "foo": true, "date": "1989-08-16T10:20:30.123Z", "num": 123 }';

      const result = parseJson(source, (key, value) => (
        (key === 'date' ? new Date(value) : value)
      ));

      expect(result).to.deep.equal({
        foo: true,
        date: new Date(619266030123),
        num: 123,
      });

    });

    it('should be compatible with native implementation', () => {

      const source = '{"obj1":{"arr1":[{"obj2":[true,false,null,0,123,-123.456e3,123.456e-3,"\\rhello world\\n","[\\u0057, \\u042F, \\u2605, \\uffFd]",{"kwTrue":true,"kwFalse":false,"kwNull":null,"zero":0,"num1":123,"num2":-123.456e3,"num3":123.456e-3,"arr2":[1,2,true,false],"str1":"\\rhello world\\n","str2":"[\\u0057, \\u042F, \\u2605, \\uffFd]"}]}]}}';

      const nativeCalls = runAndCaptureCalls(
        JSON.parse.bind(JSON)
      );

      const libCalls = runAndCaptureCalls(parseJson);

      expect(libCalls).to.deep.equal(nativeCalls);


      function runAndCaptureCalls(
        parseFunc: JsonParseFunc

      ): any[] {

        const calls: any[] = [];

        parseFunc(source, (key, value) => {
          calls.push([key, value]);
          return value;
        });

        return calls;

      }

    });

  });

  describe('reviver source text access proposal', () => {

    /**
     * {@link https://github.com/tc39/proposal-json-parse-with-source}
     */

    it('should have access to source text', () => {

      const source = '{"str":"hello\\r\\n\\t\\u2605 world","num":-1.23456e-7,"kw1":true,"kw2":false,"kw3":null,"arr":[-1.23456e-7,"hello\\r\\n\\t\\u2605 world",true,false,null]}';

      const expectedSources: Record<string, string> = {
        root: source,
        str: '"hello\\r\\n\\t\\u2605 world"',
        num: '-1.23456e-7',
        kw1: 'true',
        kw2: 'false',
        kw3: 'null',
        arr: '[-1.23456e-7,"hello\\r\\n\\t\\u2605 world",true,false,null]',
        '0': '-1.23456e-7',
        '1': '"hello\\r\\n\\t\\u2605 world"',
        '2': 'true',
        '3': 'false',
        '4': 'null'
      };

      const sources: Record<string, string> = {};

      parseJson(source, (key, value, context) => {
        sources[key || 'root'] = context.source;
      });

      expect(sources).to.deep.equal(expectedSources);

    });

    it('should have path of keys', () => {

      const source = '{"foo":[{"bar":"hello"}],"baz":{"qux":{"quux":"test","quuux":[1,2,3]}}}';

      const expected: Record<string, string> = {
        'foo.0.bar': '"hello"',
        'foo.0': '{"bar":"hello"}',
        'foo': '[{"bar":"hello"}]',
        'baz.qux.quux': '"test"',
        'baz.qux.quuux.0': '1',
        'baz.qux.quuux.1': '2',
        'baz.qux.quuux.2': '3',
        'baz.qux.quuux': '[1,2,3]',
        'baz.qux': '{"quux":"test","quuux":[1,2,3]}',
        'baz': '{"qux":{"quux":"test","quuux":[1,2,3]}}',
        '': source,
      };

      const keyValues: Record<string, string> = {};

      parseJson(source, (key, value, context) => {
        expect(context.keys).to.be.an('array');
        context.keys.forEach(key =>
          expect(key).to.be.a('string')
        );
        const path = context.keys.join('.');
        keyValues[path] = context.source;
      });

      expect(keyValues).to.deep.equal(expected);

      // Also checking order of keys
      (expect(Object.keys(keyValues))
        .to.deep.equal(Object.keys(expected))
      );

    });

    it('should parse big integers', () => {

      const source = '{ "foo": true, "big": 12345678901234567890, "num": 12345678901234567890 }';

      const result = parseJson(source, (key, value, context) => (
        (key === 'big' ? BigInt(context.source) : value)
      ));

      expect(result).to.deep.equal({
        foo: true,
        big: 12345678901234567890n,
        num: 12345678901234567000,
      });

    });

  });

});
