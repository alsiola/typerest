import * as r from "../src";
import * as t from "io-ts";

/**
 * The router has a base path, prepended to all routes, and
 * an optional stack. This stack will be used for all of the
 * routes created with this router.
 */
const router = r.createRouter({
    path: "/test",
    stack: [
        r.query(
            t.interface({
                hello: t.string
            })
        )
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
        )
    ],
    handler: ({ query: { hello, goodbye } }) => {
        return r.success({ hello, goodbye });
    }
});

r.listen(3000)(router).then(() => {
    console.log("Listening on port 3000");
});
