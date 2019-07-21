import { zip } from "lodash";

export interface ProcessedPath<K extends string> {
    path: string;
    _?: K;
}

export const path = <P extends string>(
    pathParts: TemplateStringsArray,
    ...params: P[]
): ProcessedPath<P> => {
    const path = zip(pathParts, params).reduce(
        (path, [part, param]) =>
            path + (!!part ? part : "") + (!!param ? `:${param}` : ""),
        ""
    );

    return {
        path
    };
};
