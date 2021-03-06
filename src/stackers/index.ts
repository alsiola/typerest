import { Request, Response, NextFunction } from "express";
import { Either } from "fp-ts/lib/Either";
import { RestError } from "../senders";

export * from "./body";
export * from "./query";

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

type Injected<T extends AnyStacker> = T extends Stacker<any, infer R> ? R : {};

export type AnyStacker = Stacker<any, any>;

export type Stacker1 = [Stacker<{}, any>];
export type Stacker2<T1 extends AnyStacker> = [Stacker<Injected<T1>, any>, T1];
export type Stacker3<T1 extends AnyStacker, T2 extends Stacker<T1, any>> = [
    Stacker<Injected<T1> & Injected<T2>, any>,
    T1,
    T2
];
export type Stacker4<
    T1 extends AnyStacker,
    T2 extends Stacker<T1, any>,
    T3 extends Stacker<T1 & T2, any>
> = [Stacker<Injected<T1> & Injected<T2> & Injected<T3>, any>, T1, T2, T3];
export type Stacker5<
    T1 extends AnyStacker,
    T2 extends Stacker<T1, any>,
    T3 extends Stacker<T1 & T2, any>,
    T4 extends Stacker<T1 & T2 & T3, any>
> = [
    Stacker<Injected<T1> & Injected<T2> & Injected<T3> & Injected<T4>, any>,
    T1,
    T2,
    T3,
    T4
];

export type StackerArray<
    T1 = void,
    T2 = void,
    T3 = void,
    T4 = void
> = T1 extends AnyStacker
    ? T2 extends AnyStacker
        ? T3 extends AnyStacker
            ? T4 extends AnyStacker
                ? Stacker5<T1, T2, T3, T4>
                : Stacker4<T1, T2, T3>
            : Stacker3<T1, T2>
        : Stacker2<T1>
    : Stacker1;

type InjectMany<T = {}, U = {}, V = {}, W = {}, X = {}> = Injected<T> &
    Injected<U> &
    Injected<V> &
    Injected<W> &
    Injected<X>;

export type InjectedStack<
    TStack extends StackerArray<any, any, any> | []
> = InjectMany<TStack[0], TStack[1], TStack[2], TStack[3], TStack[4]>;
