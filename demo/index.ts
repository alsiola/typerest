import * as r from "../src";
import * as t from "io-ts";
import { logger, addLogCtx } from "./logging";
import { authenticate, apiKey } from "./auth";
import { path } from "../src";

/**
 * The router has a base path, prepended to all routes, and
 * an optional stack. This stack will be used for all of the
 * routes created with this router.
 */
const router = r.createRouter({
    path: path`/organization/${"organizationId"}`,
    stack: [
        authenticate({
            strategy: apiKey("123")
        }),
        r.query(
            t.interface({
                hello: t.string
            })
        ),
        logger,
        addLogCtx("request.path")
    ]
});

/**
 * A particular route on a router has its own path, an optional
 * stack that is additive with the router stack, and a handler
 * that must Either<RestError, {}>.
 */
router.get({
    path: path`/user/${"userId"}`,
    handler: ({ params: { organizationId, userId } }) => {
        return r.success({ organizationId, userId });
    }
});

r.listen(3000)(router).then(() => {
    console.log("Listening on port 3000");
});
