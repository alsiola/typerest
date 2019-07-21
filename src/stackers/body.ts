import { Stacker } from ".";
import * as t from "io-ts";
import bodyParser from "body-parser";
import { PathReporter } from "io-ts/lib/PathReporter";
import { left } from "fp-ts/lib/Either";

export const body = <B extends any>(
    bodySchema: t.Type<B>
): Stacker<{}, { body: B }> => ({
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
