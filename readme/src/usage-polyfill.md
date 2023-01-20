
<a name="usage-polyfill"></a>
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

1). Install the polyfill package:

```shell
npm install --save @ton.js/json-parse-polyfill
```

2). Import the package only once as close to the
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
