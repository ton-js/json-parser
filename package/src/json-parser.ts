
/**
 * {@link https://www.json.org/json-en.html | JSON specification}
 */

/**
 * @public
 */
export type Maybe<Type> = (Type | undefined);

/**
 * @public
 */
export type ReviverFunc = (
  key: string,
  value: any,
  context: ReviverContext

) => any;

/**
 * @public
 */
export interface ReviverContext {
  source: string;
  keys: string[];
}

/**
 * @public
 */
export interface Options {
  throwOnProto?: Maybe<boolean>;
}

interface ParseContext {
  source: string;
  index: number;
  keys: string[];
  reviver?: Maybe<ReviverFunc>;
  options?: Maybe<Options>;
}

interface ParseResult <Type = any> {
  value: Type;
  endIndex: number;
}

type Keyword = (
  | 'true'
  | 'false'
  | 'null'
);


const codePoints: Record<string, string> = {
  '\\"': '"',
  '\\\\': '\\',
  '\\/': '/',
  '\\b': '\b',
  '\\f': '\f',
  '\\n': '\n',
  '\\r': '\r',
  '\\t': '\t',
};

/**
 * @public
 *
 * Parses JSON document and returns the parsed data.
 */
export function parseJson<Type = any>(
  source: string,
  reviver?: Maybe<ReviverFunc>,
  options?: Options

): Type {

  const result = parseValue({
    source,
    index: 0,
    keys: [],
    reviver,
    options,
  });

  const endIndex = skipSpaces(source, result.endIndex);

  if (endIndex <= (source.length - 1)) {
    throw new SyntaxError(
      `Unexpected extra characters after the parsed data: ` +
      `"${source.substring(endIndex, endIndex + 16)}…" ` +
      `at position: ${endIndex}`
    );
  }

  return result.value;

}

function parseValue(context: ParseContext): ParseResult {

  const { source, index } = context;

  let result: ParseResult;

  let i = skipSpaces(source, index);

  const newContext = nextContext(context, i);

  if (isNumberStart(source[i]!)) {

    result = parseNumber(newContext);

  } else {

    switch (source[i]) {
      case '"': {
        result = parseString(newContext);
        break;
      }
      case '[': {
        result = parseArray(newContext);
        break;
      }
      case '{': {
        result = parseObject(newContext);
        break;
      }
      case 't': {
        result = parseKeyword(newContext, 'true');
        break;
      }
      case 'f': {
        result = parseKeyword(newContext, 'false');
        break;
      }
      case 'n': {
        result = parseKeyword(newContext, 'null');
        break;
      }
      default: {
        throw new SyntaxError(
          `Unexpected character: "${source[i]}" ` +
          `at position: ${i}`
        );
      }
    }

  }

  result.value = callReviver({
    context,
    rawValue: source.substring(i, result.endIndex),
    value: result.value,
  });

  return result;

}

function parseArray(context: ParseContext): ParseResult {

  const { source, index } = context;

  const array: any[] = [];

  let i = (index + 1);
  let expectElement = false;
  let elementIndex = 0;

  while (i < source.length) {

    i = skipSpaces(source, i);

    if (source[i] === ']' && !expectElement) {
      // End of the array
      i++;
      break;
    }

    const result = parseValue(
      nextContext(context, i, elementIndex.toString())
    );

    array.push(result.value);
    i = result.endIndex;
    i = skipUntil(source, i, [',', ']']);
    if (source[i] === ',') {
      // Going to parse the next value
      expectElement = true;
      elementIndex++;
      i++;
    } else if (source[i] === ']') {
      // End of the array
      i++;
      break;
    }

  }

  return {
    value: array,
    endIndex: i,
  };

}

function parseObject(context: ParseContext): ParseResult {

  const { source, index } = context;

  let object: Record<string, any> = {};

  let i = (index + 1);
  let expectKeypair = false;

  while (i < source.length) {

    i = skipUntil(source, i, ['"', '}']);

    if (source[i] === '}' && !expectKeypair) {
      // End of the object
      i++;
      break;
    }

    // Parsing the key
    let result = parseString(
      nextContext(context, i)
    );
    const key = result.value;
    i = result.endIndex;
    i = skipUntil(source, i, ':') + 1;

    // Checking forbidden prototype property names and
    // throwing error if related option is set.
    if (context.options?.throwOnProto) {
      if (key === '__proto__') {
        throw new SyntaxError(
          `Forbidden object property name: "__proto__"`
        );
      } else if (isConstructorPrototype(key)) {
        throw new SyntaxError(
          `Forbidden object property path: "constructor.prototype"`
        );
      }
    }

    // Parsing value
    i = skipSpaces(source, i);
    result = parseValue(
      nextContext(context, i, key)
    );
    if (result.value !== undefined && isAllowedKey(key)) {
      object[key] = result.value;
    }
    i = result.endIndex;
    i = skipUntil(source, i, [',', '}']);
    if (source[i] === ',') {
      // Going to parse the next keypair
      expectKeypair = true;
      i++;
    } else if (source[i] === '}') {
      // End of the object
      i++;
      break;
    }

  }

  return {
    value: object,
    endIndex: i,
  };


  /**
   * Checks whether the key is part of "constructor.prototype"
   * path.
   */
  function isConstructorPrototype(key: string) {

    if (key !== 'prototype') {
      return false;
    }

    const parentKey = (context.keys.length > 0
      ? context.keys[context.keys.length - 1]
      : undefined
    );

    return (parentKey === 'constructor');

  }

  function isAllowedKey(key: string) {

    return (
      key !== '__proto__' &&
      !isConstructorPrototype(key)
    );

  }

}

function parseString(
  context: ParseContext

): ParseResult<string> {

  const { source, index } = context;

  let value = '';

  let i = (index + 1);

  while (i < source.length) {

    const char = source[i] as string;

    if (char === '\\') {

      const twoChars = source.substring(i, i + 2);
      const codepoint = codePoints[twoChars];

      if (codepoint) {
        value += codepoint;
        i += 2;

      } else if (twoChars === '\\u') {
        const charHex = source.substring(i + 2, i + 6);
        value += String.fromCharCode(parseInt(charHex, 16));
        i += 6;

      } else {
        throw new SyntaxError(
          `Unknown escape sequence: "${twoChars}"`
        );

      }

    } else if (char === '"') {
      // End of string
      i++;
      break;

    } else {
      value += char;
      i++;

    }

  }

  return { value, endIndex: i };

}

function isNumberStart(char: string): boolean {

  return Boolean(char.match(/^(-|\d)$/));

}

function parseNumber(
  context: ParseContext

): ParseResult<number> {

  const { source, index } = context;

  let isNegative = false;
  let integer = '0';
  let fraction = '';
  let isExponentNegative = false;
  let exponent = '';

  let i = index;

  // Parsing sign
  if (source[i] === '-') {
    isNegative = true;
    i++;
  }

  // Parsing integer part
  // -----

  if (source[i] === '0') {
    i++;

  } else if (source[i]!.match(/^[1-9]$/)) {

    integer = source[i]!;
    i++;

    while (i < source.length) {
      if (source[i]!.match(/^\d$/)) {
        integer += source[i]!;
        i++;
      } else {
        break;
      }
    }

  } else {
    throw new SyntaxError(
      `Failed to parse number at position: ${i}`
    );

  }

  // Parsing fractional part
  // -----

  if (source[i] === '.') {

    i++;

    while (i < source.length) {
      if (source[i]!.match(/^\d$/)) {
        fraction += source[i]!;
        i++;
      } else {
        break;
      }
    }

  }

  // Parsing exponent
  // -----

  if (['e', 'E'].includes(source[i]!)) {

    i++;

    if (source[i] === '+') {
      i++;
    } else if (source[i] === '-') {
      isExponentNegative = true;
      i++;
    }

    const exponentStartIndex = i;

    while (i < source.length) {
      if (source[i]!.match(/^\d$/)) {
        exponent += source[i]!;
        i++;
      } else {
        break;
      }
    }

    if (exponent.length === 0) {
      throw new SyntaxError(
        `Failed to parse number's exponent value ` +
        `at position: ${exponentStartIndex}`
      );
    }

  }

  let value = Number(
    (isNegative ? '-' : '') + integer +
    (fraction ? `.${fraction}` : '') +
    (exponent ? `e${isExponentNegative ? '-' : ''}${exponent}` : '')
  );

  return {
    value,
    endIndex: i,
  };

}

function skipUntil(
  source: string,
  startIndex: number,
  endChar: (string | string[])

): number {

  endChar = (Array.isArray(endChar) ? endChar : [endChar]);

  const i = skipSpaces(source, startIndex);

  const char = source[i] as string;

  if (endChar.includes(char)) {
    return i;

  } else {
    throw new SyntaxError(
      `Unexpected character: "${char}" ` +
      `at position: ${i}`
    );

  }

}

function skipSpaces(
  source: string,
  startIndex: number

): number {

  let i: number;

  for (i = startIndex; i < source.length; i++) {

    const char = source[i] as string;

    if (!isWhitespace(char)) {
      break;
    }

  }

  return i;

}

function isWhitespace(char: string) {
  return [' ', '\n', '\r', '\t'].includes(char);
}

function parseKeyword(
  context: ParseContext,
  keyword: Keyword,

): ParseResult {

  const { source, index } = context;

  const endIndex = (index + keyword.length);

  const slice = source.substring(index, endIndex);

  if (slice !== keyword) {
    throw new SyntaxError(
      `Failed to parse value at position: ${index}`
    );
  }

  let value = (
    keyword === 'true' ? true :
    keyword === 'false' ? false :
    null
  );

  return {
    value,
    endIndex,
  };

}

function callReviver(args: {
  context: ParseContext,
  rawValue: string;
  value: any;

}): any {

  const { context, rawValue, value } = args;
  const { reviver, keys } = context;

  if (!reviver) {
    return value;
  }

  const key = ((keys.length > 0)
    ? keys[keys.length - 1]!
    : ''
  );

  return reviver(key, value, {
    source: rawValue,
    keys,
  });

}

/**
 * A helper function that creates new parsing context
 * based on the previous one by advancing the reading index
 * and optionally adding a key to the list of keys.
 */
function nextContext(
  context: ParseContext,
  nextIndex: number,
  nextKey?: string,

): ParseContext {

  const newContext = {
    ...context,
    index: nextIndex,
  };

  if (nextKey) {
    newContext.keys = [
      ...context.keys,
      nextKey,
    ];
  }

  return newContext;

}
