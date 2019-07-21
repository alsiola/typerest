import { Stacker } from ".";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { left } from "fp-ts/lib/Either";

export const params = <P extends any>(
    paramsSchema: t.Type<P>
): Stacker<{}, { params: P }> => ({
    injector: ({ request }) => {
        return paramsSchema
            .decode(request.params)
            .map(params => ({ params }))
            .mapLeft(errors => ({
                code: 400,
                message: `Invalid params: ${PathReporter.report(
                    left(errors)
                ).join(", ")}`
            }));
    }
});
