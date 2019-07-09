import { Request, Response, Router, NextFunction } from "express";
import { Either, left, right } from "fp-ts/lib/Either";
import { compact, flatten, merge } from "lodash";
import { RestError } from "./senders";

export interface Logger {
    log: (...msgs: any[]) => void;
}

export type Middleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => void;

export type Injector<T, U> = (
    a: T & { request: Request }
) => Either<RestError, U>;

export interface Stacker<InjectorCtx, InjectorResult> {
    middleware?: Middleware[];
    injector?: Injector<InjectorCtx, InjectorResult>;
}

export type AnyStacker = Stacker<any, any>;

export type Stacker1 = [Stacker<{}, any>];
export type Stacker2<T1 extends AnyStacker> = [Stacker<Injected<T1>, any>, T1];
export type Stacker3<T1 extends AnyStacker, T2 extends Stacker<T1, any>> = [
    Stacker<Injected<T1> & Injected<T2>, any>,
    T1,
    T2
];

export type StackerArray<
    T1 extends AnyStacker | void,
    T2 extends AnyStacker | void
> = T2 extends AnyStacker
    ? T1 extends AnyStacker
        ? Stacker3<T1, T2>
        : T1 extends AnyStacker
        ? Stacker2<T1>
        : Stacker1
    : Stacker1;

/**
 * RouteOpts is the primary type that will be used to define routes.
 * The type params (TBody etc.) should be inferred from usage.
 */
export interface RouteOpts<
    // S1 extends AnyStacker | void = void,
    // S2 extends AnyStacker | void = void,
    TStack extends StackerArray<any, any> | [] = [],
    // R1 extends AnyStacker | void = void,
    // R2 extends AnyStacker | void = void,
    TRouterStack extends StackerArray<any, any> | [] = []
> {
    // Similar to express path - the endpoint
    path: string;
    /**
     * What services should be injected into the handler, e.g. resolvers
     */
    stack?: TStack;
    // How to deal with a valid request
    handler: (
        handlerArgs: HandlerArgs<TStack> &
            HandlerArgs<TRouterStack> & { request: Request }
    ) => Either<RestError, {}>;
}

type Injected<T extends AnyStacker> = T extends Stacker<any, infer R> ? R : {};

export type HandlerArgs<
    TStack extends StackerArray<any, any> | []
> = TStack extends Stacker3<any, any>
    ? Injected<TStack[0]> & Injected<TStack[1]> & Injected<TStack[2]>
    : TStack extends Stacker2<any>
    ? Injected<TStack[0]> & Injected<TStack[1]>
    : TStack extends Stacker1
    ? Injected<TStack[0]>
    : {};

const responderFactory = (res: Response) => (result: Either<RestError, {}>) => {
    result
        .map(x => res.status(200).send(x))
        .mapLeft(({ code, message }) => res.status(code).send(message));
};

const handler = <
    TStack extends StackerArray<any, any> | [] = [],
    TRouterStack extends StackerArray<any, any> | [] = []
>(
    stack: AnyStacker[],
    handler: RouteOpts<TStack, TRouterStack>["handler"]
) => async (request: Request, res: Response) => {
    const responder = responderFactory(res);

    try {
        const initialContext: { request: Request; err?: any } = { request };

        const injectionResult = await stack.reduce(
            async (out, stacker) => {
                const prev = await out;

                if (!stacker.injector) {
                    return prev;
                }

                if (prev.isLeft()) {
                    return prev;
                }

                try {
                    const injection = await stacker.injector!(prev.value);
                    return injection
                        .map(next => merge(prev.value, next))
                        .mapLeft(err => ({
                            ...prev.value,
                            err
                        }));
                } catch (err) {
                    return left({
                        err: {
                            code: 500,
                            message: "Internal server error"
                        }
                    });
                }
            },
            Promise.resolve(right(initialContext)) as Promise<
                Either<{ err: RestError }, any>
            >
        );

        injectionResult
            .map(async ctx => {
                const result = await handler(ctx as HandlerArgs<TStack>);
                responder(result);
            })
            .mapLeft(({ err }) => {
                responder(left(err));
            });
    } catch (err) {
        console.error(err);
        responder(left(err));
    }
};

const addRoute = <TRouterStack extends StackerArray<any, any> | [] = []>({
    router,
    method,
    logger,
    path,
    stack
}: {
    router: Router;
    method: "get" | "put" | "post" | "delete";
    logger: Logger;
    path: string;
    stack?: TRouterStack;
}) => <TStack extends StackerArray<any, any> | [] = []>(
    routeOpts: RouteOpts<TStack, TRouterStack>
) => {
    logger.log(`Adding ${method} route for ${routeOpts.path}`);
    const handle = handler<TStack, TRouterStack>(
        [...(stack || []), ...(routeOpts.stack || [])],
        routeOpts.handler
    );

    const middleware = flatten(
        compact([
            ...(routeOpts.stack
                ? (routeOpts.stack as AnyStacker[]).map(
                      ({ middleware }) => middleware
                  )
                : []),
            ...(stack
                ? (stack as AnyStacker[]).map(({ middleware }) => middleware)
                : [])
        ])
    );

    router[method].apply(router, [
        path + routeOpts.path,
        ...middleware,
        handle
    ] as any);
};

interface RouterOpts<TStack extends StackerArray<any, any> | []> {
    path?: string;
    stack?: TStack;
}
/**
 * Creates a customised router that will mimic the express router, but give us
 * some lovely type=safe goodies.
 * When ready for use, calling router.getRouter() will return the underlying
 * express router for use in an express app
 */
export const createRouter = <TStack extends StackerArray<any, any> | [] = []>({
    path = "",
    stack
}: RouterOpts<TStack>) => {
    const router = Router();

    return {
        get: addRoute({ router, method: "get", logger: console, path, stack }),
        put: addRoute({ router, method: "put", logger: console, path, stack }),
        post: addRoute({
            router,
            method: "post",
            logger: console,
            path,
            stack
        }),
        delete: addRoute({
            router,
            method: "delete",
            logger: console,
            path,
            stack
        }),
        use: (r: { getRouter: () => Router }) => router.use(r.getRouter()),
        getRouter: () => router
    };
};
