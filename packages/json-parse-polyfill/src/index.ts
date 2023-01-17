
import type { ReviverFunc } from '@ton.js/json-parser';
import { parseJson } from '@ton.js/json-parser';

export * from '@ton.js/json-parser';


/**
 * @public
 */
export const nativeJsonParse = JSON.parse;

// Installing the polyfill only once
if (JSON.parse !== jsonParsePolyfill) {
  JSON.parse = jsonParsePolyfill;
}


function jsonParsePolyfill(
  source: string,
  reviver?: ReviverFunc
) {

  // Polyfill is only used when the third argument is
  // defined on the reviver function, otherwise using
  // native (faster) implementation.

  return ((reviver?.length || 0) >= 3
    ? parseJson(source, reviver)
    : nativeJsonParse(source, reviver as any)
  );

}
