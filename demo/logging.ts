import { right } from "fp-ts/lib/Either";
import { Stacker } from "../src/create-router";
import { get } from "lodash";

export interface Logger {
    log: (...msgs: any[]) => void;
}

export const logger = {
    injector: ({ request }) =>
        right({
            logger: {
                log: (...msgs: any[]) =>
                    console.log({ path: request.path }, ...msgs)
            }
        })
} as Stacker<{}, { logger: Logger }>;

export const addLogCtx = (
    ...props: string[]
): Stacker<{ logger: Logger }, {}> => ({
    injector: ({ logger, ...ctx }) =>
        right({
            logger: {
                log: (...msgs: any[]) =>
                    console.log(
                        props.reduce(
                            (out, prop) => ({ ...out, [prop]: get(ctx, prop) }),
                            {}
                        ),
                        ...msgs
                    )
            }
        })
});
