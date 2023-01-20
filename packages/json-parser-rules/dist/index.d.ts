export declare type InternalReviver = (key: string, value: any, context: InternalReviverContext) => any;

export declare interface InternalReviverContext {
    source: string;
    keys: string[];
}

export declare type Maybe<Type> = (Type | undefined);

export declare interface Options {
    rules: ReviverRule[];
    parser?: Maybe<ParserFunc>;
}

export declare function parseJsonByRules<Type = any>(source: string, options: Options): Type;

export declare type ParserFunc<Type = any> = (text: string, reviver?: Maybe<InternalReviver>) => Type;

export declare type Reviver = ((context: ReviverContext) => any);

export declare interface ReviverContext {
    value: any;
    source: string;
    path: string;
}

export declare interface ReviverRule {
    pattern: (string | string[]);
    reviver: Reviver;
}

export { }
