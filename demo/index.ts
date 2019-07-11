import * as r from "../src";
import * as t from "io-ts";
import { logger, addLogCtx } from "./logging";
import { auth } from "./auth";

/**
 * The router has a base path, prepended to all routes, and
 * an optional stack. This stack will be used for all of the
 * routes created with this router.
 */
const router = r.createRouter({
    path: "/test",
    stack: [
        auth({ apiKey: "123" }),
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
    path: "/",
    stack: [
        r.query(
            t.interface({
                goodbye: t.string
            })
        ),
        addLogCtx("query.hello", "query.goodbye")
    ],
    handler: ({ query: { hello, goodbye }, logger }) => {
        logger.log("Handling request");
        return r.success({ hello, goodbye });
    }
});

r.listen(3000)(router).then(() => {
    console.log("Listening on port 3000");
});
