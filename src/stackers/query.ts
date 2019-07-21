import { Stacker } from ".";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { left } from "fp-ts/lib/Either";

export const query = <Q extends any>(
    querySchema: t.Type<Q>
): Stacker<{}, { query: Q }> => ({
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
