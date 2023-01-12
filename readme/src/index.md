
<img alt="Type definitions" src="https://img.shields.io/npm/types/@ton.js/json-parser"> <img alt="License" src="https://img.shields.io/github/license/ton-js/json-parser">
<br>
<img alt="npm (scoped with tag)" src="https://img.shields.io/npm/v/@ton.js/json-parser/beta"> <img alt="node-lts (scoped with tag)" src="https://img.shields.io/node/v-lts/@ton.js/json-parser/beta"> <img alt="npm bundle size (scoped)" src="https://img.shields.io/bundlephobia/min/@ton.js/json-parser">
<br>
<img alt="GitHub issues" src="https://img.shields.io/github/issues/ton-js/json-parser"> <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/ton-js/json-parser"> <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/ton-js/json-parser">
<hr>

# {{ packageName }}

A customizable JSON parser that is 100% compatible
with native implementation (`JSON.parse()`) adds
TC39 [source access proposal][tc39-proposal] have
better security like [secure-json-parse][secure-json-parse]
and… 25 times slower…


## Rationale

The native implementation of JSON parser in JavaScript
(i.e. `JSON.parse()`) doesn't allow to fully customize the
parsing behavior. The [JSON specification][json-standard] allows
documents to include numbers of arbitrary and unlimited size.
However, EcmaScript is using IEEE 754 standard to represent
numbers internally and doesn't support numbers of the unlimited
size. This leads to the data loss when `JSON.parse()` is
attempting to read big numbers from the JSON documents.

Modern versions of JavaScript support a special BigInt data
type specifically designed to represent integer numbers of
unlimited size, but there is no way to tell `JSON.parse()`
to use `BigInt` for parsing numbers.

Web 3.0 community tends to use very big numbers to represent
cryptocurrency values, like the number of nanocoins in transaction.
This library was designed as a workaround that allows to read
big integer numbers from the JSON documents. However, considering
that it's a full-fledged customized JSON parser you can use it
for other cases as well.


## Contents
<!-- using remark-toc -->


## Features

- modern cross-platform multi-format package that can be
  used in any JavaScript environment,

- written in pure super-strict TypeScript with 100% type coverage,

- minimum size package with zero dependencies,

- robust [security practices][security-policy],

- 100% compatible with the [JSON standard][json-standard]
  and native `JSON.parse()` implementation,

- future-compatible by implementing the Stage-3
  TC39 [source access proposal][tc39-proposal],

- adds special handling for `__proto__` and `constructor.prototype`
  object properties to implement better security,

- extensively covered by [unit tests][tests] and tested out
  on multiple real-life [JSON samples][test-samples],

- parses `1 MB` of nested JSON in `~40 ms`.
  (25 times slower than native implementation).


## Install

```sh
npm install --save @ton.js/json-parser
```


## Usage

Please see the [examples project][examples] for the complete
examples.

### Simple parsing

```ts
import { parseJson } from '@ton.js/json-parser';

interface DocumentType {
 // …
}

const object = parseJson<DocumentType>('{ … }');
// object type will be: DocumentType
```

### Using native reviver

```ts
const content = '{ "birthDate": "1989-08-16T10:20:30.123Z" }';

const object = parseJson<DocumentType>(content, (key, value) => (
  (key.endsWith('Date') ? new Date(value) : value)
));

assert(object.birthDate instanceof Date);
```

### Using reviver with source text access

```ts
const content = '{ "valueBN": 12345678901234567890 }';

const object = parseJson<DocumentType>(content, (key, value, context) => (
  (key.endsWith('BN') ? BigInt(context.source) : value)
));

assert.equal(typeof object.valueBN, 'bigint');
```

### Using key path

```ts
const content = '{ "foo": { "bar": { "value": 12345678901234567890 } } }';

const object = parseJson<DocumentType>(content, (key, value, context) => (
  (context.keys.join('.') === 'foo.bar.value' ? BigInt(context.source) : value)
));

assert.equal(typeof object.foo.bar.value, 'bigint');
```


## Benchmarks

{{ benchmarks | safe }}


## Security

Please see our [security policy][security-policy].


## Contributing

Want to help? Please see the [contributing guide][contributing].


## Support

If you have any questions regarding this library or
TON development in general — feel free to join our official
[TON development][tondev-chat] Telegram group.


{% include "./license.md" %}



  [contributing]: ./CONTRIBUTING.md
  [test-samples]: ./package/test/samples
  [tests]: ./package/src/json-parser.test.ts
  [examples]: ./examples/node-esm

  [security-policy]: https://github.com/ton-js/json-parser/security/policy
  [json-standard]: https://www.json.org/json-en.html
  [secure-json-parse]: https://github.com/fastify/secure-json-parse
  [tc39-proposal]: https://github.com/tc39/proposal-json-parse-with-source
  [tondev-chat]: https://t.me/tondev_eng
