
<a name="usage-ponyfill"></a>
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
