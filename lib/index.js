"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Either_1 = require("fp-ts/lib/Either");
exports.success = Either_1.right;
exports.failure = Either_1.left;
const express_1 = __importDefault(require("express"));
const create_router_1 = require("./create-router");
exports.createRouter = create_router_1.createRouter;
__export(require("./stackers"));
__export(require("./path"));
exports.listen = (port) => (...routers) => {
    const app = express_1.default();
    routers.forEach(r => app.use(r.getRouter()));
    return new Promise(resolve => {
        app.listen(port, (err) => {
            if (err) {
                resolve(Either_1.left(err));
            }
            else {
                resolve(Either_1.right({}));
            }
        });
    });
};
