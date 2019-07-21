import { Stacker } from ".";
import * as t from "io-ts";
export declare const body: <B extends any>(bodySchema: t.Type<B, B, unknown>) => Stacker<{}, {
    body: B;
}>;
