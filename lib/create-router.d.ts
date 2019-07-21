import { Request, Router } from "express";
import { Either } from "fp-ts/lib/Either";
import { RestError } from "./senders";
import { StackerArray, InjectedStack } from "./stackers";
import { ProcessedPath } from "./path";
/**
 * RouteOpts is the primary type that will be used to define routes.
 * The type params (TBody etc.) should be inferred from usage.
 */
export interface RouteOpts<TStack extends StackerArray<any, any, any> | [] = [], TRouterStack extends StackerArray<any, any, any> | [] = [], TParams extends string = ""> {
    path: ProcessedPath<TParams>;
    /**
     * What services should be injected into the handler, e.g. resolvers
     */
    stack?: TStack;
    handler: (handlerArgs: InjectedStack<TStack> & InjectedStack<TRouterStack> & {
        params: Record<TParams, string>;
    } & {
        request: Request;
    }) => Either<RestError, {}>;
}
interface RouterOpts<TStack extends StackerArray<any, any, any> | []> {
    path?: string;
    stack?: TStack;
}
/**
 * Creates a customised router that will mimic the express router, but give us
 * some lovely type=safe goodies.
 * When ready for use, calling router.getRouter() will return the underlying
 * express router for use in an express app
 */
export declare const createRouter: <TStack extends [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any, any] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [] = []>({ path, stack }: RouterOpts<TStack>) => {
    get: <TStack extends [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [] = [], TParams extends string = "">(routeOpts: RouteOpts<TStack, TStack, TParams>) => void;
    put: <TStack extends [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [] = [], TParams extends string = "">(routeOpts: RouteOpts<TStack, TStack, TParams>) => void;
    post: <TStack extends [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [] = [], TParams extends string = "">(routeOpts: RouteOpts<TStack, TStack, TParams>) => void;
    delete: <TStack extends [import("./stackers").Stacker<{}, any>] | [import("./stackers").Stacker<{} | {}, any>, any, any] | [import("./stackers").Stacker<{} | {}, any>, any] | [] = [], TParams extends string = "">(routeOpts: RouteOpts<TStack, TStack, TParams>) => void;
    use: (r: {
        getRouter: () => Router;
    }) => import("express-serve-static-core").Router;
    getRouter: () => import("express-serve-static-core").Router;
};
export {};
