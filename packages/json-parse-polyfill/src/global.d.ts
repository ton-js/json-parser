
declare global {
  interface JSON {
    parse<Type = any>(text: string, reviver?: ReviverFunc): Type;
  }
}
