import { Stacker } from "./create-router";
import * as t from "io-ts";
import bodyParser from "body-parser";
import { PathReporter } from "io-ts/lib/PathReporter";
import { left } from "fp-ts/lib/Either";

export const body = <P extends any>(
    bodySchema: t.Type<P>
): Stacker<{}, { body: P }> => ({
    middleware: [bodyParser.json()],
    injector: ({ request }) => {
        return bodySchema
            .decode(request.body)
            .map(body => ({ body }))
            .mapLeft(errors => ({
                code: 400,
                message: `Invalid body: ${PathReporter.report(
                    left(errors)
                ).join(", ")}`
            }));
    }
});

export const query = <P extends any>(
    querySchema: t.Type<P>
): Stacker<{}, { query: P }> => ({
    middleware: [],
    injector: ({ request }) => {
        return querySchema
            .decode(request.query)
            .map(query => ({ query }))
            .mapLeft(errors => ({
                code: 400,
                message: `Invalid query string: ${PathReporter.report(
                    left(errors)
                ).join(", ")}`
            }));
    }
});
