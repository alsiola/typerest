import { Request, Response, Router } from "express";
import { Either, left, right } from "fp-ts/lib/Either";
import { compact, flatten, merge } from "lodash";
import { RestError } from "./senders";
import { StackerArray, InjectedStack, AnyStacker } from "./stackers";
import { ProcessedPath } from "./path";

/**
 * RouteOpts is the primary type that will be used to define routes.
 * The type params (TBody etc.) should be inferred from usage.
 */
export interface RouteOpts<
    // S1 extends AnyStacker | void = void,
    // S2 extends AnyStacker | void = void,
    TStack extends StackerArray<any, any, any> | [] = [],
    // R1 extends AnyStacker | void = void,
    // R2 extends AnyStacker | void = void,
    TRouterStack extends StackerArray<any, any, any> | [] = [],
    TParams extends string = ""
> {
    // Result of using path helper, generating a type checker
    path: ProcessedPath<TParams>;
    /**
     * What services should be injected into the handler, e.g. resolvers
     */
    stack?: TStack;
    // How to deal with a valid request
    handler: (
        handlerArgs: InjectedStack<TStack> &
            InjectedStack<TRouterStack> & {
                params: Record<TParams, string>;
            } & { request: Request }
    ) => Either<RestError, {}>;
}

const responderFactory = (res: Response) => (result: Either<RestError, {}>) => {
    result
        .map(x => res.status(200).send(x))
        .mapLeft(({ code, message }) => res.status(code).send(message));
};

const handler = <
    TStack extends StackerArray<any, any, any> | [] = [],
    TRouterStack extends StackerArray<any, any, any> | [] = []
>(
    stack: AnyStacker[],
    handler: RouteOpts<TStack, TRouterStack>["handler"]
) => async (request: Request, res: Response) => {
    const responder = responderFactory(res);

    try {
        const { params = {} } = request;

        const initialContext: {
            request: Request;
            params: Record<string, string>;
            err?: any;
        } = {
            request,
            params
        };

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
                const result = await handler(ctx as InjectedStack<TStack>);
                responder(result);
            })
            .mapLeft(({ err }) => {
                responder(left(err));
            });
    } catch (err) {
        console.error(err);
        responder(left({ code: 500, message: "Internal server error" }));
    }
};

const addRoute = <
    TRouterStack extends StackerArray<any, any, any> | [] = [],
    TBaseParams extends string = ""
>({
    router,
    method,
    path,
    stack
}: {
    router: Router;
    method: "get" | "put" | "post" | "delete";
    path: ProcessedPath<TBaseParams>;
    stack?: TRouterStack;
}) => <
    TStack extends StackerArray<any, any> | [] = [],
    TParams extends string = ""
>(
    routeOpts: RouteOpts<TStack, TRouterStack, TParams | TBaseParams>
) => {
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
        path + routeOpts.path.path,
        ...middleware,
        handle
    ] as any);
};

interface RouterOpts<
    TStack extends StackerArray<any, any, any> | [],
    TParams extends string
> {
    path?: ProcessedPath<TParams>;
    stack?: TStack;
}
/**
 * Creates a customised router that will mimic the express router, but give us
 * some lovely type=safe goodies.
 * When ready for use, calling router.getRouter() will return the underlying
 * express router for use in an express app
 */
export const createRouter = <
    TStack extends StackerArray<any, any, any> | [] = [],
    TParams extends string = ""
>({
    path = { path: "" },
    stack
}: RouterOpts<TStack, TParams>) => {
    const router = Router();

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
        use: (r: { getRouter: () => Router }) => router.use(r.getRouter()),
        getRouter: () => router
    };
};
