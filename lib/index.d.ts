import { Either, right, left } from "fp-ts/lib/Either";
import express from "express";
import { createRouter } from "./create-router";
export * from "./stackers";
export * from "./path";
export { right as success, left as failure };
export { createRouter };
export { RouteOpts } from "./create-router";
export declare const listen: (port: number) => (...routers: {
    get: <TStack extends [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [] = [], TParams extends string = "">(routeOpts: import("./create-router").RouteOpts<TStack, [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any, any] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [], TParams>) => void;
    put: <TStack extends [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [] = [], TParams extends string = "">(routeOpts: import("./create-router").RouteOpts<TStack, [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any, any] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [], TParams>) => void;
    post: <TStack extends [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [] = [], TParams extends string = "">(routeOpts: import("./create-router").RouteOpts<TStack, [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any, any] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [], TParams>) => void;
    delete: <TStack extends [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [] = [], TParams extends string = "">(routeOpts: import("./create-router").RouteOpts<TStack, [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any, any] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [], TParams>) => void;
    use: (r: {
        getRouter: () => express.Router;
    }) => import("express-serve-static-core").Router;
    getRouter: () => import("express-serve-static-core").Router;
}[]) => Promise<Either<string, {}>>;
