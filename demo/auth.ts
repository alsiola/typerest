import { Stacker } from "../src/create-router";
import { Either, right, left } from "fp-ts/lib/Either";
import { Request } from "express";

export type AuthenticationStrategy = (req: Request) => Either<string, true>;

export const apiKey = (apiKey: string): AuthenticationStrategy => req =>
    req.headers["x-api-key"] === apiKey
        ? right(true as true)
        : left("Unauthorised");

export const authenticate = ({
    strategy
}: {
    strategy: AuthenticationStrategy;
}): Stacker<{}, {}> => ({
    middleware: [
        (req, res, next) => {
            strategy(req)
                .map(next)
                .mapLeft(err => res.status(401).send(err));
        }
    ]
});
