"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Either_1 = require("fp-ts/lib/Either");
const lodash_1 = require("lodash");
const PathReporter_1 = require("io-ts/lib/PathReporter");
const responderFactory = (res) => (result) => {
    result
        .map(x => res.status(200).send(x))
        .mapLeft(({ code, message }) => res.status(code).send(message));
};
const handler = (stack, handler, path) => (request, res) => __awaiter(this, void 0, void 0, function* () {
    const responder = responderFactory(res);
    try {
        const { params = {} } = request;
        const paramsCheckerResult = path.checker.decode(params);
        if (paramsCheckerResult.isLeft()) {
            paramsCheckerResult.mapLeft(errors => ({
                code: 400,
                message: `Invalid body: ${PathReporter_1.PathReporter.report(Either_1.left(errors)).join(", ")}`
            }));
        }
        const initialContext = {
            request,
            params
        };
        const injectionResult = yield stack.reduce((out, stacker) => __awaiter(this, void 0, void 0, function* () {
            const prev = yield out;
            if (!stacker.injector) {
                return prev;
            }
            if (prev.isLeft()) {
                return prev;
            }
            try {
                const injection = yield stacker.injector(prev.value);
                return injection
                    .map(next => lodash_1.merge(prev.value, next))
                    .mapLeft(err => (Object.assign({}, prev.value, { err })));
            }
            catch (err) {
                return Either_1.left({
                    err: {
                        code: 500,
                        message: "Internal server error"
                    }
                });
            }
        }), Promise.resolve(Either_1.right(initialContext)));
        injectionResult
            .map((ctx) => __awaiter(this, void 0, void 0, function* () {
            const result = yield handler(ctx);
            responder(result);
        }))
            .mapLeft(({ err }) => {
            responder(Either_1.left(err));
        });
    }
    catch (err) {
        console.error(err);
        responder(Either_1.left({ code: 500, message: "Internal server error" }));
    }
});
const addRoute = ({ router, method, path, stack }) => (routeOpts) => {
    const handle = handler([...(stack || []), ...(routeOpts.stack || [])], routeOpts.handler, routeOpts.path);
    const middleware = lodash_1.flatten(lodash_1.compact([
        ...(routeOpts.stack
            ? routeOpts.stack.map(({ middleware }) => middleware)
            : []),
        ...(stack
            ? stack.map(({ middleware }) => middleware)
            : [])
    ]));
    router[method].apply(router, [
        path + routeOpts.path.result,
        ...middleware,
        handle
    ]);
};
/**
 * Creates a customised router that will mimic the express router, but give us
 * some lovely type=safe goodies.
 * When ready for use, calling router.getRouter() will return the underlying
 * express router for use in an express app
 */
exports.createRouter = ({ path = "", stack }) => {
    const router = express_1.Router();
    return {
        get: addRoute({ router, method: "get", path, stack }),
        put: addRoute({ router, method: "put", path, stack }),
        post: addRoute({
            router,
            method: "post",
            path,
            stack
        }),
        delete: addRoute({
            router,
            method: "delete",
            path,
            stack
        }),
        use: (r) => router.use(r.getRouter()),
        getRouter: () => router
    };
};
