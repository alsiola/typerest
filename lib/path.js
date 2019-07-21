"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const t = __importStar(require("io-ts"));
// const p = <T extends t.Props = t.Props, U= t.TypeC<T>>(a: string, _:  U) => a;
exports.path = (pathParts, ...params) => {
    const checker = t.interface(params.reduce((out, param) => (Object.assign({}, out, { [param]: t.string })), {}));
    const result = lodash_1.zip(pathParts, params).reduce((path, [part, param]) => path + (!!part ? part : "") + (!!param ? `:${param}` : ""), "");
    return {
        result,
        checker
    };
};
