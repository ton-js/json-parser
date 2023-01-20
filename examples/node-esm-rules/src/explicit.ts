
import { parseJson } from '@ton.js/json-parser';
import { parseJsonByRules } from '@ton.js/json-parser-rules';

import type { ParseResult } from './common.js';
import { content, rules, testResults } from './common.js';


const result = parseJsonByRules<ParseResult>(content, {
  rules,
  parser: parseJson,
});

testResults(result);
