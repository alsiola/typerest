import * as t from "io-ts";
export interface ProcessedPath<K extends string> {
    result: string;
    checker: t.TypeC<Record<K, t.StringC>>;
}
export declare const path: <P extends string>(pathParts: TemplateStringsArray, ...params: P[]) => ProcessedPath<P>;
