import { Stacker } from "../src/create-router";

export const auth = ({ apiKey }: { apiKey: string }): Stacker<{}, {}> => ({
    middleware: [
        (req, res, next) => {
            if (req.headers["x-api-key"] === apiKey) {
                return next();
            }

            res.status(401).send("Unauthorised");
        }
    ]
});
