
export function doParse<Type>(source: string): Type {
  return JSON.parse(source, (key, value, context) =>
    (key.endsWith('BN') ? BigInt(context.source) : value)
  );
}
