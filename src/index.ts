import { Either, right, left } from "fp-ts/lib/Either";
export { RouteOpts } from "./create-router";
import express from "express";

import { createRouter } from "./create-router";
export * from "./stackers";
export { right as success, left as failure };
export { createRouter };

export const listen = (port: number) => (
    ...routers: Array<ReturnType<typeof createRouter>>
): Promise<Either<string, {}>> => {
    const app = express();

    routers.forEach(r => app.use(r.getRouter()));

    return new Promise(resolve => {
        app.listen(port, (err?: string) => {
            if (err) {
                resolve(left(err));
            } else {
                resolve(right({}));
            }
        });
    });
};
