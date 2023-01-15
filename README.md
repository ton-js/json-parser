<img alt="Type definitions" src="https://img.shields.io/npm/types/@ton.js/json-parser"> <img alt="License" src="https://img.shields.io/github/license/ton-js/json-parser"> <br> <img alt="npm (scoped with tag)" src="https://img.shields.io/npm/v/@ton.js/json-parser/beta"> <img alt="node-lts (scoped with tag)" src="https://img.shields.io/node/v-lts/@ton.js/json-parser/beta"> <img alt="npm bundle size (scoped)" src="https://img.shields.io/bundlephobia/min/@ton.js/json-parser"> <br> <img alt="GitHub issues" src="https://img.shields.io/github/issues/ton-js/json-parser"> <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/ton-js/json-parser"> <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/ton-js/json-parser">

<hr>

# @ton.js/json-parser

A customizable JSON parser that is 100% compatible
with native implementation (`JSON.parse()`),
can be used as a [polyfill](#polyfill-usage),
adds TC39 [source access proposal][tc39-proposal] and additional features,
have better security like [secure-json-parse][secure-json-parse]
and is… 25 times slower…

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

*   [Features](#features)
*   [Normal usage (ponyfill)](#normal-usage-ponyfill)
    *   [Simple parsing](#simple-parsing)
    *   [Using native reviver](#using-native-reviver)
    *   [Using reviver with source text access](#using-reviver-with-source-text-access)
    *   [Using key path](#using-key-path)
    *   [Throwing on prototypes](#throwing-on-prototypes)
*   [Polyfill usage](#polyfill-usage)
    *   [Prerequisites](#prerequisites)
    *   [Simple parsing](#simple-parsing-1)
    *   [Using native reviver](#using-native-reviver-1)
    *   [Using reviver with source text access](#using-reviver-with-source-text-access-1)
    *   [Using key path](#using-key-path-1)
*   [Benchmarks](#benchmarks)
    *   [Normal dataset](#normal-dataset)
    *   [Big dataset](#big-dataset)
*   [Security](#security)
*   [Contributing](#contributing)
*   [Support](#support)

## Features

*   modern cross-platform multi-format package that can be
    used in any JavaScript environment,

*   written in pure super-strict TypeScript with 100% type coverage,

*   minimum size package with zero dependencies,

*   robust [security practices][security-policy],

*   100% compatible with the [JSON standard][json-standard]
    and native `JSON.parse()` implementation,
    can be used as a [polyfill](#polyfill-usage),

*   future-compatible by implementing the Stage-3
    TC39 [source access proposal][tc39-proposal] and additional
    features,

*   adds special handling for `__proto__` and `constructor.prototype`
    object properties to implement better security,

*   extensively covered by [unit tests][tests] and tested out
    on multiple real-life [JSON samples][test-samples],

*   parses `1 MB` of nested JSON in `~40 ms`.
    (25 times slower than native implementation).

## Normal usage (ponyfill)

> Ponyfill is a side effects free package that provides
> an alternative implementation and doesn't affect the native
> behavior of the system.

Install the package first:

```sh
npm install --save @ton.js/json-parser
```

Please see the [examples project][examples-ponyfill]
for the complete examples.

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
interface DocumentType {
  birthDate: Date;
}

const content = '{ "birthDate": "1989-08-16T10:20:30.123Z" }';

const object = parseJson<DocumentType>(content, (key, value) => (
  (key.endsWith('Date') ? new Date(value) : value)
));

assert(object.birthDate instanceof Date);
```

### Using reviver with source text access

```ts
interface DocumentType {
  valueBN: bigint;
}

const content = '{ "valueBN": 12345678901234567890 }';

const object = parseJson<DocumentType>(content, (key, value, context) => (
  (key.endsWith('BN') ? BigInt(context.source) : value)
));

assert.equal(typeof object.valueBN, 'bigint');
```

### Using key path

```ts
interface DocumentType {
  foo: {
    bar: {
      value: bigint;
    };
  };
}

const content = '{ "foo": { "bar": { "value": 12345678901234567890 } } }';

const object = parseJson<DocumentType>(content, (key, value, context) => (
  (context.keys.join('.') === 'foo.bar.value' ? BigInt(context.source) : value)
));

assert.equal(typeof object.foo.bar.value, 'bigint');
```

### Throwing on prototypes

In order to prevent parsed object prototype override the
JSON parser will automatically skip `__proto__` and
`constructor.prototype` properties. However, you can use
the `throwOnProto: true` option to make this behavior more
explicit — the parser will throw an error instead:

```ts
const content = '{ "foo": true, "__proto__": {} }';

try {
  parseJson(content, undefined, {
    throwOnProto: true,
  });

} catch (error: any) {
  // Forbidden object property name: "__proto__"
  console.log(error);

}
```

<a name="polyfill-usage"></a>

## Polyfill usage

> The polyfill implements the Stage-3 TC39
> [source access proposal][tc39-proposal] and adds some
> additional useful features.

Polyfill is a package that when globally imported, overrides
the behavior of the native `JSON.parse()` method. The polyfill
will detect the number of arguments that your reviver function
has and will use custom JSON parser implementation only when
it has three parameters (i.e. `context`), in other case the
native implementation will be used instead.

Please see the [polyfill examples project][examples-polyfill]
for the complete examples.

> Be advised, that polyfill can't detect if you are using
> `arguments[2]` to access the `context`, so make sure to
> use a normal function parameter.

### Prerequisites

1\). Install the polyfill package:

```shell
npm install --save @ton.js/json-parse-polyfill
```

2\). Import the package only once as close to the
beginning of your program as possible:

```typescript
import '@ton.js/json-parse-polyfill';

(function main() {
  // …
})();
```

### Simple parsing

```ts
interface DocumentType {
 // …
}

// Native implementation will be used
const object = <DocumentType> JSON.parse('{ … }');
```

### Using native reviver

```ts
interface DocumentType {
  birthDate: Date;
}

const content = '{ "birthDate": "1989-08-16T10:20:30.123Z" }';

// Native implementation will be used
const object = <DocumentType> JSON.parse(content, (key, value) => (
  (key.endsWith('Date') ? new Date(value) : value)
));

assert(object.birthDate instanceof Date);
```

### Using reviver with source text access

```ts
import type { ReviverFunc } from '@ton.js/json-parse-polyfill';

interface DocumentType {
  valueBN: bigint;
}

const content = '{ "valueBN": 12345678901234567890 }';

// Custom implementation will be used
const reviver: ReviverFunc = (key, value, context) => (
  (key.endsWith('BN') ? BigInt(context.source) : value)
);

const object = <DocumentType> (
  JSON.parse(content, reviver as any)
);

assert.equal(typeof object.valueBN, 'bigint');
```

### Using key path

```ts
import type { ReviverFunc } from '@ton.js/json-parse-polyfill';

interface DocumentType {
  foo: {
    bar: {
      value: bigint;
    };
  };
}

const content = '{ "foo": { "bar": { "value": 12345678901234567890 } } }';

const reviver: ReviverFunc = (key, value, context) => (
  ((context.keys.join('.') === 'foo.bar.value')
    ? BigInt(context.source)
    : value
  )
);

// Custom implementation will be used
const object = <DocumentType> (
  JSON.parse(content, reviver as any)
);

assert.equal(typeof object.foo.bar.value, 'bigint');
```

## Benchmarks

### Normal dataset

<table><thead><tr><th>name</th><th>ops</th><th>margin</th><th>percentSlower</th></tr></thead><tbody><tr><td>native</td><td>12279</td><td>0.34</td><td>0</td></tr><tr><td>parse-json</td><td>444</td><td>1.57</td><td>96.38</td></tr></tbody></table>

### Big dataset

<table><thead><tr><th>name</th><th>ops</th><th>margin</th><th>percentSlower</th></tr></thead><tbody><tr><td>native</td><td>31</td><td>0.52</td><td>0</td></tr><tr><td>parse-json</td><td>3</td><td>2.65</td><td>90.32</td></tr></tbody></table>

## Security

Please see our [security policy][security-policy].

## Contributing

Want to help? Please see the [contributing guide][contributing].

## Support

If you have any questions regarding this library or
TON development in general — feel free to join our official
[TON development][tondev-chat] Telegram group.

## The MIT License (MIT)

Copyright © 2023 TON FOUNDATION

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons
to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall
be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[contributing]: ./CONTRIBUTING.md

[test-samples]: ./packages/json-parser/test/samples

[tests]: ./packages/json-parser/src/json-parser.test.ts

[examples-ponyfill]: ./examples/node-esm

[examples-polyfill]: ./examples/node-esm-polyfill

[security-policy]: https://github.com/ton-js/json-parser/security/policy

[json-standard]: https://www.json.org/json-en.html

[secure-json-parse]: https://github.com/fastify/secure-json-parse

[tc39-proposal]: https://github.com/tc39/proposal-json-parse-with-source

[tondev-chat]: https://t.me/tondev_eng
