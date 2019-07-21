import { Stacker } from ".";
import * as t from "io-ts";
export declare const query: <Q extends any>(querySchema: t.Type<Q, Q, unknown>) => Stacker<{}, {
    query: Q;
}>;
