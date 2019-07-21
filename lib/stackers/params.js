"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PathReporter_1 = require("io-ts/lib/PathReporter");
const Either_1 = require("fp-ts/lib/Either");
exports.params = (paramsSchema) => ({
    injector: ({ request }) => {
        return paramsSchema
            .decode(request.params)
            .map(params => ({ params }))
            .mapLeft(errors => ({
            code: 400,
            message: `Invalid params: ${PathReporter_1.PathReporter.report(Either_1.left(errors)).join(", ")}`
        }));
    }
});
