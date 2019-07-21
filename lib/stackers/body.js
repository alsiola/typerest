"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const PathReporter_1 = require("io-ts/lib/PathReporter");
const Either_1 = require("fp-ts/lib/Either");
exports.body = (bodySchema) => ({
    middleware: [body_parser_1.default.json()],
    injector: ({ request }) => {
        return bodySchema
            .decode(request.body)
            .map(body => ({ body }))
            .mapLeft(errors => ({
            code: 400,
            message: `Invalid body: ${PathReporter_1.PathReporter.report(Either_1.left(errors)).join(", ")}`
        }));
    }
});
