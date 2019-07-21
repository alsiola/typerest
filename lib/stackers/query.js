"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PathReporter_1 = require("io-ts/lib/PathReporter");
const Either_1 = require("fp-ts/lib/Either");
exports.query = (querySchema) => ({
    middleware: [],
    injector: ({ request }) => {
        return querySchema
            .decode(request.query)
            .map(query => ({ query }))
            .mapLeft(errors => ({
            code: 400,
            message: `Invalid query string: ${PathReporter_1.PathReporter.report(Either_1.left(errors)).join(", ")}`
        }));
    }
});
