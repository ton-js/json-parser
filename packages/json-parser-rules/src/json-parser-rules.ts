
export type Maybe<Type> = (Type | undefined);

export interface Options {
  rules: ReviverRule[];
  parser?: Maybe<ParserFunc>;
}

export interface ReviverRule {
  pattern: (string | string[]);
  reviver: Reviver;
}

export type Reviver = (
  (context: ReviverContext) => any
);

export interface ReviverContext {
  value: any;
  source: string;
  path: string;
}

export type ParserFunc<Type = any> = (
  text: string,
  reviver?: Maybe<InternalReviver>
) => Type;

export type InternalReviver = (
  key: string,
  value: any,
  context: InternalReviverContext
) => any;

export interface InternalReviverContext {
  source: string;
  keys: string[];
}

type CompiledRule = [Matcher, Reviver];
type Matcher = (RegExp | string);


export function parseJsonByRules<Type = any>(
  source: string,
  options: Options

): Type {

  const compiledRules = compileRules(options.rules);

  const parser: ParserFunc = (
    options.parser ??
    <ParserFunc> JSON.parse
  );

  return parser(source, (key, value, context) => {

    const { keys, source } = context;

    const path = keys.join('.');

    const reviver = findReviver(path);

    if (!reviver) {
      return value;
    }

    return reviver({
      value,
      source,
      path,
    });

  });


  function findReviver(path: string): Maybe<Reviver> {

    for (const [matcher, reviver] of compiledRules) {

      if (typeof matcher === 'string') {
        if (matcher === path) {
          return reviver;
        }
      } else {
        if (matcher.test(path)) {
          return reviver;
        }
      }

    }

    return undefined;

  }

  function compileRules(
    rules: ReviverRule[]

  ): CompiledRule[] {

    const compiledRules: CompiledRule[] = [];

    for (const rule of rules) {

      const patterns = (Array.isArray(rule.pattern)
        ? rule.pattern
        : [rule.pattern]
      );

      for (const pattern of patterns) {
        const matcher = compilePattern(pattern);
        compiledRules.push([matcher, rule.reviver]);
      }

    }

    return compiledRules;

  }

  function compilePattern(pattern: string): (RegExp | string) {

    let parts = [];
    let isRegExp = false;

    for (const token of pattern.split('.')) {
      if (token === '**') {
        parts.push('.*');
        isRegExp = true;
      } else if (token.includes('*')) {
        parts.push(token.replace(/\*/g, '[^\\.]*?'));
        isRegExp = true;
      } else {
        parts.push(token);
      }
    }

    if (isRegExp) {

      const rePattern = (
        '^' + parts.join('\\.') + '$'
      );

      return new RegExp(rePattern);

    } else {

      return pattern;

    }

  }

}
