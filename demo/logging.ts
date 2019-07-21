import { right } from "fp-ts/lib/Either";
import { get } from "lodash";
import { Stacker } from "../src";

interface Logger {
    log: (...msgs: any[]) => void;
}

export const logger = {
    injector: () =>
        right({
            logger: {
                log: console.log
            },
            _ctx: {}
        })
} as Stacker<{}, { logger: Logger; _ctx: any }>;

export const addLogCtx = (
    ...props: string[]
): Stacker<{ logger: Logger; _ctx: any }, {}> => ({
    injector: ({ logger, _ctx, ...ctx }) => {
        const ctxWithExtra = props.reduce(
            (out, prop) => ({ ...out, [prop]: get(ctx, prop) }),
            _ctx
        );
        return right({
            _ctx: ctxWithExtra,
            logger: {
                log: (...msgs: any[]) => console.log(ctxWithExtra, ...msgs)
            }
        });
    }
});
