/**
 * {@link https://www.json.org/json-en.html | JSON specification}
 */
/**
 * @public
 */
export declare type Maybe<Type> = (Type | undefined);

/**
 * @public
 */
export declare let nativeJsonParse: typeof JSON.parse;

/**
 * @public
 */
export declare interface Options {
    throwOnProto?: Maybe<boolean>;
}

/**
 * @public
 *
 * Parses JSON document and returns the parsed data.
 */
export declare function parseJson<Type = any>(source: string, reviver?: Maybe<ReviverFunc>, options?: Options): Type;

/**
 * @public
 */
export declare interface ReviverContext {
    source: string;
    keys: string[];
}

/**
 * @public
 */
export declare type ReviverFunc = (key: string, value: any, context: ReviverContext) => any;

export { }

declare global {
  interface JSON {
    parse<Type = any>(text: string, reviver?: ReviverFunc): Type;
  }
}
