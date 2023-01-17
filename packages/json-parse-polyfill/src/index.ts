
import type { ReviverFunc } from '@ton.js/json-parser';

import { parseJson } from '@ton.js/json-parser';


export * from '@ton.js/json-parser';


/**
 * @public
 */
let nativeJsonParse: typeof JSON.parse;

// Installing the polyfill only once
if (JSON.parse !== jsonParsePolyfill) {
  nativeJsonParse = JSON.parse;
  JSON.parse = jsonParsePolyfill;
}

export { nativeJsonParse };


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
