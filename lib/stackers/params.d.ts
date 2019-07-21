import { Stacker } from ".";
import * as t from "io-ts";
export declare const params: <P extends any>(paramsSchema: t.Type<P, P, unknown>) => Stacker<{}, {
    params: P;
}>;
